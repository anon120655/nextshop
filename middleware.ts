import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip these pages from token check
  const excludedPaths = ["/backoffice/login", "/backoffice/guest"];

  // If the path is in excludedPaths, proceed without checking token
  if (excludedPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Check token in cookies
  const token = request.cookies.get("token")?.value;
  if (!token && pathname.startsWith("/backoffice")) {
    return NextResponse.redirect(new URL("/backoffice/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/backoffice/:path*"],
};
