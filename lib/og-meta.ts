import type { Metadata } from "next";
import { locales, type Locale } from "./locale-helpers";
import { SITE_NAME } from "./constants";

// 로케일 → Open Graph locale 코드.
const OG_LOCALE: Record<Locale, string> = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
};

// 페이지 openGraph를 로케일별 og:locale/alternateLocale과 함께 일관되게 구성한다.
// (페이지가 openGraph를 정의하면 root layout의 openGraph를 덮으므로 여기서 공통화한다)
export function buildOpenGraph(input: {
  locale: Locale;
  url: string;
  title?: string;
  description?: string;
  type?: "website" | "article";
  publishedTime?: string;
  tags?: string[];
}): Metadata["openGraph"] {
  const { locale, url, title, description, type, publishedTime, tags } = input;
  return {
    type: type ?? "website",
    siteName: SITE_NAME,
    url,
    locale: OG_LOCALE[locale],
    alternateLocale: locales
      .filter((l) => l !== locale)
      .map((l) => OG_LOCALE[l]),
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(publishedTime ? { publishedTime } : {}),
    ...(tags ? { tags } : {}),
  } as Metadata["openGraph"];
}
