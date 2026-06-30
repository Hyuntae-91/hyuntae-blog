import type { Metadata } from "next";
import type { Locale } from "./locale-helpers";

// 번역이 실제 존재하는 로케일만 hreflang으로 노출하고, x-default는 원문으로 모은다.
// 번역 준비 중 로케일까지 hreflang에 넣으면 빈(리다이렉트) 페이지로 신호가 새어
// 검색엔진이 중복·저품질로 본다.
// baseUrl은 호출부(SITE_URL)에서 주입해 순수 함수로 유지한다.
export function buildPostLanguageAlternates({
  baseUrl,
  path,
  availableLocales,
  originalLang,
}: {
  baseUrl: string;
  path: string;
  availableLocales: Locale[];
  originalLang: Locale;
}): Record<string, string> {
  return {
    ...Object.fromEntries(
      availableLocales.map((locale) => [locale, `${baseUrl}/${locale}/${path}`])
    ),
    "x-default": `${baseUrl}/${originalLang}/${path}`,
  };
}

// 이 로케일 번역이 아직 없는 글(번역 준비 중 모달) → 검색엔진 색인을 막고
// canonical은 원문 URL로 모은다. noindex가 없으면 빈 페이지가 색인되고,
// canonical을 원문으로 박지 않으면 루트 레이아웃 기본값(SITE_URL)으로 신호가 샌다.
export function buildPendingTranslationMetadata({
  baseUrl,
  title,
  path,
  originalLang,
}: {
  baseUrl: string;
  title: string;
  path: string;
  originalLang: Locale;
}): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${baseUrl}/${originalLang}/${path}`,
    },
  };
}
