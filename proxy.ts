import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  INTERNAL_TRAFFIC_COOKIE_MAX_AGE,
  INTERNAL_TRAFFIC_COOKIE_NAME,
  shouldMarkInternalTraffic,
} from "@/lib/analytics";
import {
  COOKIE_NAME,
  detectPreferredLocale,
  locales,
} from "@/lib/locale-helpers";

function withInternalTrafficCookie(
  response: NextResponse,
  request: NextRequest
) {
  if (shouldMarkInternalTraffic(request.nextUrl.searchParams)) {
    response.cookies.set(INTERNAL_TRAFFIC_COOKIE_NAME, "1", {
      maxAge: INTERNAL_TRAFFIC_COOKIE_MAX_AGE,
      path: "/",
    });
  }
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    if (!shouldMarkInternalTraffic(request.nextUrl.searchParams)) return;
    return withInternalTrafficCookie(NextResponse.next(), request);
  }

  // Redirect to locale-prefixed path
  const locale = detectPreferredLocale({
    cookieLocale: request.cookies.get(COOKIE_NAME)?.value,
    country:
      request.nextUrl.searchParams.get("country") ??
      request.headers.get("x-vercel-ip-country"),
    acceptLanguage: request.headers.get("accept-language"),
  });

  request.nextUrl.pathname = `/${locale}${pathname}`;
  return withInternalTrafficCookie(NextResponse.redirect(request.nextUrl), request);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
