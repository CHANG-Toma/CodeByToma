import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "cbt_session";

function getDashboardSlug(): string {
  return (process.env.DASHBOARD_BASE_PATH ?? "").replace(/^\/+|\/+$/g, "");
}

function getSecret(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

type TokenClaims = {
  role: "admin" | "client";
};

async function readClaims(
  token: string,
  secret: Uint8Array,
): Promise<TokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role === "client" ? "client" : "admin";
    return { role };
  } catch {
    return null;
  }
}

/**
 * Filet serveur : dashboard admin + espace client.
 * Non authentifié → /connexion (page unique).
 */
export async function middleware(request: NextRequest) {
  const slug = getDashboardSlug();
  const { pathname } = request.nextUrl;
  const secret = getSecret();
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isEspace = pathname === "/espace" || pathname.startsWith("/espace/");
  const isDashboard = Boolean(slug) && pathname.startsWith(`/${slug}`);

  if (!isEspace && !isDashboard) {
    return NextResponse.next();
  }

  if (!token || !secret) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    return NextResponse.redirect(url);
  }

  const claims = await readClaims(token, secret);
  if (!claims) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return res;
  }

  if (isDashboard && claims.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/espace";
    return NextResponse.redirect(url);
  }

  if (isEspace && claims.role !== "client") {
    const url = request.nextUrl.clone();
    url.pathname = slug ? `/${slug}` : "/connexion";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
