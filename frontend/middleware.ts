import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/upload",
  "/dashboard",
  "/history",
  "/settings",
  "/reports",
  "/compliance",
  "/simulator",
  "/suppliers",
  "/supply-chain",
  "/processing",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if current route requires authentication
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for session cookie (cs_session or supabase auth token)
  const sessionCookie = request.cookies.get("cs_session")?.value;
  const hasSbAuth = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") || c.name.includes("auth-token"));

  if (!sessionCookie && !hasSbAuth) {
    // Unauthenticated user -> redirect to /login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/upload/:path*",
    "/dashboard/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/reports/:path*",
    "/compliance/:path*",
    "/simulator/:path*",
    "/suppliers/:path*",
    "/supply-chain/:path*",
    "/processing/:path*",
  ],
};
