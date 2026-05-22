import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAccount = req.nextUrl.pathname.startsWith("/account");
  const isDonorPortal =
    req.nextUrl.pathname.startsWith("/donor-portal") &&
    !req.nextUrl.pathname.includes("/login");

  if ((isAccount || isDonorPortal) && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/account/:path*", "/donor-portal/:path*"],
};
