import type { MetadataRoute } from "next";
import type { Locale } from "./locale-helpers";

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

export interface LocalizablePost {
  availableLocales: Locale[];
  date: string;
}

// 글별로 "실제 번역이 존재하는 로케일"만 사이트맵 항목으로 만든다.
// 번역이 없는 로케일까지 넣으면 '번역 준비 중' 페이지가 색인돼 중복·저품질
// 신호가 된다. lastModified는 빌드 시각이 아니라 글 작성일로 박아, 모든 URL이
// 매 배포마다 같은 시각으로 갱신되는 문제를 없앤다.
export function buildLocalizedPostEntries<T extends LocalizablePost>(
  posts: T[],
  urlFor: (post: T, locale: Locale) => string,
  options: { changeFrequency: ChangeFrequency; priority: number }
): MetadataRoute.Sitemap {
  return posts.flatMap((post) =>
    post.availableLocales.map((locale) => ({
      url: urlFor(post, locale),
      lastModified: new Date(post.date),
      changeFrequency: options.changeFrequency,
      priority: options.priority,
    }))
  );
}

// 글 목록에서 가장 최근 작성일. 홈·목록 페이지의 lastModified로 쓴다
// (새 글이 추가될 때만 갱신 → 매 빌드마다 흔들리지 않는다).
// 파싱 불가능한 날짜는 무시하고, 유효한 날짜가 하나도 없으면 undefined.
export function latestPostDate(posts: { date: string }[]): Date | undefined {
  const times = posts
    .map((post) => new Date(post.date).getTime())
    .filter((time) => !Number.isNaN(time));

  if (times.length === 0) return undefined;
  return new Date(Math.max(...times));
}
