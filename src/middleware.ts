import { NextResponse, type NextRequest } from "next/server";

import {
  SITE_ACCESS_COOKIE,
  getSitePassword,
  isValidAccessToken,
} from "@/lib/siteAuth";

/** Only Assessment Assistant (Schoology) is password-gated. */
function isSchoologyProtectedPath(pathname: string): boolean {
  return (
    pathname === "/assessment-assistant" ||
    pathname.startsWith("/assessment-assistant/") ||
    pathname.startsWith("/api/assessment-assistant/")
  );
}

export async function middleware(request: NextRequest) {
  const password = getSitePassword();
  if (!password) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (!isSchoologyProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SITE_ACCESS_COOKIE)?.value;
  if (await isValidAccessToken(token)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Unauthorized. Enter the Schoology access password at /login." },
      { status: 401 },
    );
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  const nextPath = `${pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("next", nextPath || "/assessment-assistant");
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/assessment-assistant", "/assessment-assistant/:path*", "/api/assessment-assistant/:path*"],
};
