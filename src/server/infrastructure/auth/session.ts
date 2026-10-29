import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { UnauthorizedError } from "@/server/domain/errors";
import { deps } from "@/server/application/container";
import { signInSchema } from "@/server/application/schemas";
import { hashRateLimitSubject } from "./client-ip";

const COOKIE_NAME = "cbt_session";
const MAX_AGE_SEC = 60 * 60 * 8; // 8 h — session pro plus courte
const FAIL_DELAY_MS = 400;
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

type SessionPayload = {
  sub: string;
  email: string;
};

type AttemptBucket = { count: number; resetAt: number };

/** Rate-limit process-local (MVP). En multi-instance : Redis. */
const loginAttempts = new Map<string, AttemptBucket>();

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET manquant ou trop court (32+ caractères)");
  }
  return new TextEncoder().encode(secret);
}

function touchAttempt(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (entry.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  entry.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

async function delayOnFailure(): Promise<void> {
  await new Promise((r) => setTimeout(r, FAIL_DELAY_MS));
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

/**
 * @param ipKey empreinte IP (voir getClientIpKey) — jamais l'IP en clair
 */
export async function signIn(
  input: unknown,
  ipKey = "unknown",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    await delayOnFailure();
    return { ok: false, error: "Identifiants invalides" };
  }

  const emailKey = hashRateLimitSubject(parsed.data.email);
  const ipLimit = touchAttempt(`ip:${ipKey}`);
  const emailLimit = touchAttempt(`email:${emailKey}`);

  if (!ipLimit.allowed || !emailLimit.allowed) {
    await delayOnFailure();
    return {
      ok: false,
      error: "Trop de tentatives. Réessayez dans quelques minutes.",
    };
  }

  const user = await deps.users.findByEmail(parsed.data.email.toLowerCase());
  if (!user) {
    await delayOnFailure();
    return { ok: false, error: "Identifiants invalides" };
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    await delayOnFailure();
    await deps.audit.append({
      action: "auth.signin_failed",
      entity: "User",
      entityId: user.id,
      metadata: { reason: "bad_credentials" },
    });
    return { ok: false, error: "Identifiants invalides" };
  }

  // Succès : reset des compteurs pour cette empreinte
  loginAttempts.delete(`ip:${ipKey}`);
  loginAttempts.delete(`email:${emailKey}`);

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
