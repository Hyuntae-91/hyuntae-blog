import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getAllSlugs, getLifePosts } from "@/lib/posts";
import { LIFE_CATEGORY_IDS, isLifeCategory } from "@/lib/categories";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs();
  // 취미 글 목록(슬러그·카테고리). 색인 노출용이라 한 로케일 기준으로 한 번만 읽는다.
  const lifePosts = getLifePosts("ko").filter((post) =>
    isLifeCategory(post.category)
  );
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({
      url: `${SITE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    });

    entries.push({
      url: `${SITE_URL}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    entries.push({
      url: `${SITE_URL}/${locale}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });

    for (const slug of slugs) {
      entries.push({
        url: `${SITE_URL}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    // 취미 영역(/life): 허브 + 카테고리 + 글. 개발 포트폴리오보다 우선순위를 낮게 둔다.
    entries.push({
      url: `${SITE_URL}/${locale}/life`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    });

    for (const category of LIFE_CATEGORY_IDS) {
      entries.push({
        url: `${SITE_URL}/${locale}/life/${category}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.4,
      });
    }

    for (const post of lifePosts) {
      entries.push({
        url: `${SITE_URL}/${locale}/life/${post.category}/${post.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.4,
      });
    }
  }

  return entries;
}
