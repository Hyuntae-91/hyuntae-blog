import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveLegacyRedirect } from "@/lib/constants";
import {
  COOKIE_NAME,
  detectPreferredLocale,
  locales,
} from "@/lib/locale-helpers";

export function proxy(request: NextRequest) {
  // 구 도메인(vercel.app)으로 들어온 요청은 정식 도메인으로 영구 이전한다(로케일 분기보다 먼저).
  const legacyTarget = resolveLegacyRedirect(
    request.headers.get("host"),
    request.nextUrl.pathname + request.nextUrl.search
  );
  if (legacyTarget) return NextResponse.redirect(legacyTarget, 308);

  const { pathname } = request.nextUrl;

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect to locale-prefixed path
  const locale = detectPreferredLocale({
    cookieLocale: request.cookies.get(COOKIE_NAME)?.value,
    country:
      request.nextUrl.searchParams.get("country") ??
      request.headers.get("x-vercel-ip-country"),
    acceptLanguage: request.headers.get("accept-language"),
  });

  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
