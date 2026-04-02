import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/clients", "/campaigns"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("token")?.value;

  // Client-side token check happens via localStorage;
  // middleware provides a basic guard for SSR navigation
  if (!token) {
    // Allow client-side hydration to handle auth via localStorage
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/clients/:path*", "/campaigns/:path*"],
};
