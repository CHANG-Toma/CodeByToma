import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { UnauthorizedError } from "@/server/domain/errors";
import { deps } from "@/server/application/container";
import { signInSchema } from "@/server/application/schemas";

const COOKIE_NAME = "cbt_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 jours

type SessionPayload = {
  sub: string;
  email: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET manquant ou trop court (32+ caractères)");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

/** Rate-limit login en mémoire (process) — suffisant mono-user MVP. */
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count += 1;
  return true;
}

export async function signIn(
  input: unknown,
  ipKey = "local",
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!checkRateLimit(ipKey)) {
    return { ok: false, error: "Trop de tentatives. Réessayez plus tard." };
  }

  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Identifiants invalides" };
  }

  const user = await deps.users.findByEmail(parsed.data.email.toLowerCase());
  if (!user) {
    return { ok: false, error: "Identifiants invalides" };
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Identifiants invalides" };
  }

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
  });
  await setSessionCookie(token);

  await deps.audit.append({
    userId: user.id,
    action: "auth.signin",
    entity: "User",
    entityId: user.id,
  });

  return { ok: true };
}

export async function signOut(): Promise<void> {
  const session = await getSession();
  await clearSessionCookie();
  if (session) {
    await deps.audit.append({
      userId: session.sub,
      action: "auth.signout",
      entity: "User",
      entityId: session.sub,
    });
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
