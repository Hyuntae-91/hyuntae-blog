import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, AUTHOR } from "./constants";
import type { Locale } from "./locale-helpers";

type JsonLdObject = Record<string, unknown>;

function personSchema(): JsonLdObject {
  return {
    "@type": "Person",
    name: AUTHOR.name,
    alternateName: AUTHOR.alternateName,
    jobTitle: AUTHOR.jobTitle,
    url: SITE_URL,
    sameAs: AUTHOR.sameAs,
  };
}

// 글 상세 페이지용 BlogPosting 스키마. 검색·AI가 글의 제목/저자/날짜/주제를 구조적으로 읽는다.
export function buildBlogPostingSchema(params: {
  slug: string;
  locale: Locale;
  title: string;
  description: string;
  date: string;
  tags: string[];
  category: string;
}): JsonLdObject {
  const url = `${SITE_URL}/${params.locale}/blog/${params.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: params.title,
    description: params.description,
    datePublished: params.date,
    dateModified: params.date,
    inLanguage: params.locale,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: personSchema(),
    publisher: personSchema(),
    ...(params.tags.length > 0 ? { keywords: params.tags.join(", ") } : {}),
    ...(params.category ? { articleSection: params.category } : {}),
  };
}

// 글 상세 페이지용 BreadcrumbList 스키마. 검색 결과에 경로(홈 > 블로그 > 글)를 노출한다.
export function buildBreadcrumbSchema(params: {
  locale: Locale;
  slug: string;
  title: string;
  blogLabel: string;
}): JsonLdObject {
  const base = `${SITE_URL}/${params.locale}`;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: base },
      { "@type": "ListItem", position: 2, name: params.blogLabel, item: `${base}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: params.title,
        item: `${base}/blog/${params.slug}`,
      },
    ],
  };
}

// 메인 페이지용 WebSite + 저자(Person) 스키마.
export function buildWebSiteSchema(locale: Locale): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/${locale}`,
    inLanguage: locale,
    author: personSchema(),
  };
}
