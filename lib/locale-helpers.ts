export const locales = ["ko", "en", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const COOKIE_NAME = "NEXT_LOCALE";

export function hasLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocaleFromCountry(country: string | null): Locale {
  if (!country) return defaultLocale;

  const map: Record<string, Locale> = {
    KR: "ko",
    JP: "ja",
  };

  return map[country.toUpperCase()] ?? defaultLocale;
}

export function detectPreferredLocale({
  cookieLocale,
  country,
  acceptLanguage,
}: {
  cookieLocale?: string | null;
  country?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (cookieLocale && hasLocale(cookieLocale)) {
    return cookieLocale;
  }

  const countryLocale = getLocaleFromCountry(country ?? null);
  if (countryLocale !== defaultLocale || country?.toUpperCase() === "US") {
    return countryLocale;
  }

  const normalizedAcceptLanguage = (acceptLanguage ?? "").toLowerCase();
  if (normalizedAcceptLanguage.includes("ko")) return "ko";
  if (normalizedAcceptLanguage.includes("ja")) return "ja";

  return defaultLocale;
}

export function replacePathLocale(pathname: string, locale: Locale): string {
  if (!pathname || pathname === "/") {
    return `/${locale}`;
  }

  const segments = pathname.split("/");

  if (segments[1] && hasLocale(segments[1])) {
    segments[1] = locale;
  } else {
    segments.splice(1, 0, locale);
  }

  return segments.join("/");
}

export function getLocaleFontClass(locale: Locale): string {
  return `font-locale-${locale}`;
}

export function resolvePostSourceLocale({
  requestedLocale,
  availableLocales,
  originalLocale,
}: {
  requestedLocale: Locale;
  availableLocales: Locale[];
  originalLocale: Locale;
}): Locale | null {
  if (availableLocales.includes(requestedLocale)) {
    return requestedLocale;
  }

  if (availableLocales.includes(originalLocale)) {
    return originalLocale;
  }

  return availableLocales[0] ?? null;
}

export function resolvePostHrefLocale({
  requestedLocale,
  availableLocales,
  originalLocale,
}: {
  requestedLocale: Locale;
  availableLocales: Locale[];
  originalLocale: Locale;
}): Locale {
  return availableLocales.includes(requestedLocale)
    ? requestedLocale
    : originalLocale;
}
