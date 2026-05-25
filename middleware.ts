import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Legacy URL compatibility (/dashboard, /admin).
 * Role-specific targets are adjusted in the portal shell when needed.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const suffix = pathname === "/admin" ? "" : pathname.slice("/admin".length);
    const url = request.nextUrl.clone();
    url.pathname = `/platform${suffix}`;
    return NextResponse.redirect(url);
  }

  if (pathname === "/dashboard/rooms" || pathname.startsWith("/dashboard/rooms/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/branch/property";
    return NextResponse.redirect(url);
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const suffix =
      pathname === "/dashboard" ? "" : pathname.slice("/dashboard".length);
    const url = request.nextUrl.clone();
    url.pathname = `/branch${suffix}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/dashboard", "/dashboard/:path*"],
};
