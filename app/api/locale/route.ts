import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_NAME,
  defaultLocale,
  hasLocale,
} from "@/lib/locale-helpers";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale");
  const redirectParam = request.nextUrl.searchParams.get("redirect");

  const locale =
    localeParam && hasLocale(localeParam) ? localeParam : defaultLocale;
  const redirectPath =
    redirectParam && redirectParam.startsWith("/")
      ? redirectParam
      : `/${locale}`;

  const response = NextResponse.redirect(new URL(redirectPath, request.url));
  response.cookies.set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
  });

  return response;
}
