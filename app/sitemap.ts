import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getAllPosts, getLifePosts } from "@/lib/posts";
import { LIFE_CATEGORY_IDS, isLifeCategory } from "@/lib/categories";
import { SITE_URL } from "@/lib/constants";
import {
  buildLocalizedPostEntries,
  latestPostDate,
} from "@/lib/sitemap-entries";

export default function sitemap(): MetadataRoute.Sitemap {
  // getAllPosts는 공개 전(draft) 글을 제외하므로, Coming Soon 글은 색인에서 빠진다.
  const devPosts = getAllPosts("ko");
  // 취미 글 목록(슬러그·카테고리). 색인 노출용이라 한 로케일 기준으로 한 번만 읽는다.
  const lifePosts = getLifePosts("ko").filter((post) =>
    isLifeCategory(post.category)
  );

  // 집계 페이지(홈·목록)는 글이 추가될 때만 갱신되도록 최신 글 작성일을 lastmod로.
  const devUpdated = latestPostDate(devPosts);
  const lifeUpdated = latestPostDate(lifePosts);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({
      url: `${SITE_URL}/${locale}`,
      lastModified: devUpdated,
      changeFrequency: "weekly",
      priority: 1.0,
    });

    entries.push({
      url: `${SITE_URL}/${locale}/blog`,
      lastModified: devUpdated,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    // about은 글 날짜와 무관한 정적 페이지라 lastmod를 생략한다(빌드 시각 박제 방지).
    entries.push({
      url: `${SITE_URL}/${locale}/about`,
      changeFrequency: "monthly",
      priority: 0.7,
    });

    // 취미 영역(/life): 허브 + 카테고리. 개발 포트폴리오보다 우선순위를 낮게 둔다.
    entries.push({
      url: `${SITE_URL}/${locale}/life`,
      lastModified: lifeUpdated,
      changeFrequency: "weekly",
      priority: 0.5,
    });

    for (const category of LIFE_CATEGORY_IDS) {
      entries.push({
        url: `${SITE_URL}/${locale}/life/${category}`,
        lastModified: lifeUpdated,
        changeFrequency: "weekly",
        priority: 0.4,
      });
    }
  }

  // 글 상세: 번역이 실제로 존재하는 로케일만, 작성일을 lastmod로 박는다.
  // (번역 준비 중 페이지가 색인되면 중복·저품질 신호가 되므로 사이트맵에서 뺀다.)
  entries.push(
    ...buildLocalizedPostEntries(
      devPosts,
      (post, locale) => `${SITE_URL}/${locale}/blog/${post.slug}`,
      { changeFrequency: "monthly", priority: 0.6 }
    ),
    ...buildLocalizedPostEntries(
      lifePosts,
      (post, locale) => `${SITE_URL}/${locale}/life/${post.category}/${post.slug}`,
      { changeFrequency: "monthly", priority: 0.4 }
    )
  );

  return entries;
}
