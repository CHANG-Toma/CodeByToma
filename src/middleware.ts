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

/**
 * Filet serveur : protège le dashboard.
 * Non authentifié → /connexion (page unique, pas de /signin doublon).
 */
export async function middleware(request: NextRequest) {
  const slug = getDashboardSlug();
  if (!slug) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const prefix = `/${slug}`;

  if (!pathname.startsWith(prefix)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = getSecret();

  if (!token || !secret) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf assets Next / fichiers statiques courants.
     * Le filtre fin se fait dans le middleware via DASHBOARD_BASE_PATH.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
