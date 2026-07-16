import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/constants";
import { loadOgFont } from "@/lib/og-font";
import { locales } from "@/lib/locale-helpers";

// 홈·About·블로그 목록 등 글 상세가 아닌 [locale] 하위 페이지의 기본 OG 이미지.
// 글 상세 페이지는 자체 opengraph-image.tsx가 우선 적용된다.
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// generateStaticParams가 없으면 이 라우트가 매 요청마다 Satori 렌더링을 돌고
// CDN 캐시도 안 걸린다(실측: 동일 URL 2연속 호출 모두 x-vercel-cache MISS).
// locale 3개뿐이라 빌드 타임에 전부 정적 생성한다.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const TAGLINE: Record<string, string> = {
  ko: "백엔드 개발자 블로그 — OpenSearch · Spring · Python",
  en: "Backend developer blog — OpenSearch · Spring · Python",
  ja: "バックエンド開発者のブログ — OpenSearch · Spring · Python",
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tagline = TAGLINE[locale] ?? TAGLINE.en;
  const fontData = await loadOgFont(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 28,
          padding: "0 90px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          fontFamily: "title",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 38,
            color: "#94a3b8",
            lineHeight: 1.4,
          }}
        >
          {tagline}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "title", data: fontData, weight: 700, style: "normal" }]
        : [],
    }
  );
}
