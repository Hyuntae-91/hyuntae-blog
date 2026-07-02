import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug";
import { remarkMermaid } from "@/lib/remark-mermaid";
import { extractToc } from "@/lib/toc";
import { hasLocale, getDictionary, type Locale, locales } from "@/lib/i18n";
import { getPost, getLifePosts, getPostSummary } from "@/lib/posts";
import { rankRelatedPosts } from "@/lib/related-posts";
import { getCategory, isLifeCategory } from "@/lib/categories";
import { TranslationPendingModal } from "@/components/translation-pending-modal";
import { ComingSoonView } from "@/components/coming-soon-view";
import { mdxComponents } from "@/components/mdx-components";
import { PostView } from "@/components/post-view";
import { JsonLd } from "@/components/json-ld";
import {
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
} from "@/lib/structured-data";
import { buildOpenGraph } from "@/lib/og-meta";
import {
  buildPendingTranslationMetadata,
  buildPostLanguageAlternates,
} from "@/lib/post-metadata";
import { turso } from "@/lib/turso";
import { getPageViews } from "@/lib/page-views";
import { SITE_URL } from "@/lib/constants";

// 본문이 빌드 타임에 박제되지 않도록 60초마다 백그라운드 재생성(ISR)한다.
// 조회수 자체는 이 주기와 무관하게 view-counter.tsx가 클라이언트에서
// 매번 Turso를 직접 fetch해 표시한다.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, category, slug } = await params;
  if (!hasLocale(locale) || !isLifeCategory(category)) return {};

  const summary = getPostSummary(slug, locale, "life");
  if (!summary) return {};
  // 공개 전(Coming Soon) 글은 검색엔진에 색인되지 않도록 noindex.
  if (summary.isDraft) {
    return { title: summary.title, robots: { index: false, follow: false } };
  }

  const post = await getPost(slug, locale, "life");
  const base = `life/${category}/${slug}`;
  // 번역 준비 중 글 → noindex + canonical을 원문으로(상세 근거는 lib/post-metadata).
  if (!post) {
    return buildPendingTranslationMetadata({
      baseUrl: SITE_URL,
      title: summary.title,
      path: base,
      originalLang: summary.originalLang,
    });
  }

  const { meta } = post;
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.tags,
    openGraph: buildOpenGraph({
      locale: locale as Locale,
      url: `${SITE_URL}/${locale}/${base}`,
      title: meta.title,
      description: meta.description,
      type: "article",
      publishedTime: meta.date,
      tags: meta.tags,
    }),
    alternates: {
      canonical: `${SITE_URL}/${locale}/${base}`,
      // 실제 번역이 있는 로케일만 hreflang으로 노출하고, x-default는 원문으로.
      languages: buildPostLanguageAlternates({
        baseUrl: SITE_URL,
        path: base,
        availableLocales: meta.availableLocales,
        originalLang: meta.originalLang,
      }),
    },
  };
}

export async function generateStaticParams() {
  // 카테고리는 글의 frontmatter에서 가져온다. 번역이 없는 로케일도 생성해
  // (개발 블로그와 동일하게) 번역 준비 중 안내를 보여준다.
  const posts = getLifePosts("ko");
  const params: { locale: string; category: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const post of posts) {
      if (!isLifeCategory(post.category)) continue;
      params.push({ locale, category: post.category, slug: post.slug });
    }
  }
  return params;
}

export default async function LifePostPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale, category, slug } = await params;
  if (!hasLocale(locale) || !isLifeCategory(category)) notFound();

  const summary = getPostSummary(slug, locale, "life");

  // 실존하지 않는 슬러그 → 진짜 404.
  if (!summary) notFound();

  // 의도적으로 건 링크지만 아직 공개 전 → 404 대신 Coming Soon 안내.
  if (summary.isDraft) {
    return (
      <ComingSoonView
        locale={locale}
        title={summary.title}
        backHref={`/${locale}/life/${category}`}
      />
    );
  }

  const post = await getPost(slug, locale, "life");

  // 공개된 글이지만 이 언어 번역이 아직 없음 → 원문으로 유도.
  if (!post) {
    return (
      <TranslationPendingModal
        locale={locale}
        originalLocale={summary.originalLang}
        slug={slug}
        redirectHref={`/${summary.originalLang}/life/${category}/${slug}`}
      />
    );
  }

  const dict = await getDictionary(locale);
  const { meta, content } = post;
  const categoryDef = getCategory(category);
  const categoryLabel = categoryDef?.label[locale] ?? category;

  const initialViews = turso ? await getPageViews(turso, slug) : 0;

  const { content: mdxContent } = await compileMDX({
    source: content,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMermaid],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeShiki,
            {
              themes: { light: "catppuccin-latte", dark: "catppuccin-mocha" },
              defaultColor: false,
              defaultLanguage: "plaintext",
              fallbackLanguage: "plaintext",
            },
          ],
        ],
      },
    },
  });

  const toc = extractToc(content);

  // 관련 글: 취미 영역 전체에서 태그 유사도로 선정(카테고리 경계 넘을 수 있음).
  const related = rankRelatedPosts(getLifePosts(locale), {
    slug,
    tags: meta.tags,
    category: meta.category,
  }).map((r) => ({
    slug: r.slug,
    title: r.title,
    href: `/${r.hrefLocale}/life/${r.category}/${r.slug}`,
  }));

  return (
    <>
      <JsonLd
        data={buildBlogPostingSchema({
          path: `life/${category}/${slug}`,
          locale: locale as Locale,
          title: meta.title,
          description: meta.description,
          date: meta.date,
          tags: meta.tags,
          category: meta.category,
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema({
          locale: locale as Locale,
          items: [
            { name: dict.life.hubTitle, path: "life" },
            { name: categoryLabel, path: `life/${category}` },
            { name: meta.title, path: `life/${category}/${slug}` },
          ],
        })}
      />
      <PostView
        slug={slug}
        locale={locale}
        meta={meta}
        content={mdxContent}
        toc={toc}
        initialViews={initialViews}
        dict={dict}
        selfHref={(l) => `/${l}/life/${category}/${slug}`}
        categoryHref={`/${locale}/life/${category}`}
        categoryLabel={categoryLabel}
        related={related}
        morePostsHref={`/${locale}/life/${category}`}
      />
    </>
  );
}
