import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || req.cookies.get("accessToken")?.value;

  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  // UI PROTECTION ONLY - redirects users away from /admin routes
  // This is NOT security - users can still call backend APIs directly
  // Always implement backend API protection too
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};