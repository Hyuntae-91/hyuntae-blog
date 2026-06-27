// canonical/sitemap/og 등 모든 절대 URL의 기준 주소.
// 잘못된 도메인이 박히면 검색·AI 색인이 전부 무력화되므로 안전한 순서로 결정한다.
function resolveSiteUrl(): string {
  // 1) 명시적 설정 우선 — 커스텀 도메인으로 전환 시 이 환경변수만 바꾸면 된다.
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  // 2) Vercel이 자동 주입하는 프로덕션 도메인 — 환경변수 누락 사고를 방지한다.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  // 3) 로컬 개발 기본값.
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

// 구 프로덕션 도메인. 커스텀 도메인 전환 후에도 기존 색인·외부 링크가 남아있으므로
// 여기로 들어온 요청은 정식 도메인으로 영구(308) 이전해 SEO 권위를 합친다.
// 프리뷰 배포(해시 호스트)·로컬은 건드리지 않도록 명시적 호스트만 대상으로 한다.
export const LEGACY_HOSTS = ["hyuntae-blog.vercel.app"];

// 구 도메인 요청이면 정식 도메인의 동일 경로 절대 URL을, 아니면 null을 반환한다.
export function resolveLegacyRedirect(
  host: string | null,
  pathWithQuery: string
): string | null {
  if (!host || !LEGACY_HOSTS.includes(host)) return null;
  const target = new URL(pathWithQuery, SITE_URL);
  // 정식 도메인이 아직 구 도메인이면(환경변수 미설정) 자기 자신으로의 리다이렉트 루프를 막는다.
  if (target.host === host) return null;
  return target.toString();
}

export const SITE_NAME = "hyuntae's blog";
export const SITE_DESCRIPTION =
  "Backend developer blog — OpenSearch, Spring, Python, and more";

// 구조화 데이터(JSON-LD)·llms.txt에서 공통으로 쓰는 저자 정보.
export const AUTHOR = {
  name: "Hyuntae Kim",
  alternateName: "Ken",
  jobTitle: "Backend Developer",
  sameAs: [
    "https://github.com/Hyuntae-91",
    "https://www.linkedin.com/in/hyuntae-kim-8aa09514b/",
  ],
} as const;
