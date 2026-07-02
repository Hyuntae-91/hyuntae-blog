import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug";
import { remarkMermaid } from "@/lib/remark-mermaid";
import { extractToc } from "@/lib/toc";
import { hasLocale, getDictionary, type Locale, locales } from "@/lib/i18n";
import { getPost, getAllSlugs, getAllPosts, getPostSummary } from "@/lib/posts";
import { rankRelatedPosts } from "@/lib/related-posts";
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

// 본문(마크다운 컴파일 등)이 빌드 타임에 박제되지 않도록 60초마다 백그라운드
// 재생성(ISR)한다. 조회수 자체는 이 주기와 무관하게 view-counter.tsx가
// 클라이언트에서 매번 Turso를 직접 fetch해 표시한다.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) return {};

  const summary = getPostSummary(slug, locale);
  if (!summary) return {};
  // 공개 전(Coming Soon) 글은 검색엔진에 색인되지 않도록 noindex.
  if (summary.isDraft) {
    return { title: summary.title, robots: { index: false, follow: false } };
  }

  const post = await getPost(slug, locale);
  // 이 로케일 번역이 아직 없는 글(번역 준비 중 모달) → 검색엔진에 색인되지 않게
  // noindex 처리하고 canonical은 원문 URL로 모은다(상세 근거는 lib/post-metadata).
  if (!post) {
    return buildPendingTranslationMetadata({
      baseUrl: SITE_URL,
      title: summary.title,
      path: `blog/${slug}`,
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
      url: `${SITE_URL}/${locale}/blog/${slug}`,
      title: meta.title,
      description: meta.description,
      type: "article",
      publishedTime: meta.date,
      tags: meta.tags,
    }),
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog/${slug}`,
      // 실제 번역이 있는 로케일만 hreflang으로 노출하고, x-default는 원문으로.
      languages: buildPostLanguageAlternates({
        baseUrl: SITE_URL,
        path: `blog/${slug}`,
        availableLocales: meta.availableLocales,
        originalLang: meta.originalLang,
      }),
      types: {
        "application/rss+xml": `${SITE_URL}/${locale}/feed.xml`,
      },
    },
  };
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) notFound();

  const summary = getPostSummary(slug, locale);

  // 실존하지 않는 슬러그(오타 링크 등) → 진짜 404.
  if (!summary) notFound();

  // 내가 의도적으로 건 링크지만 아직 공개 전 → 404 대신 Coming Soon 안내.
  if (summary.isDraft) {
    return (
      <ComingSoonView
        locale={locale}
        title={summary.title}
        backHref={`/${locale}/blog`}
      />
    );
  }

  const post = await getPost(slug, locale);

  // 공개된 글이지만 이 언어 번역이 아직 없음 → 원문으로 유도하는 모달.
  if (!post) {
    return (
      <TranslationPendingModal
        locale={locale}
        originalLocale={summary.originalLang}
        slug={slug}
      />
    );
  }

  const dict = await getDictionary(locale);
  const { meta, content } = post;

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
              // 기존 디자인 톤(catppuccin)과 일관. defaultColor:false면 색을
              // inline 박지 않고 CSS 변수(--shiki-light/--shiki-dark)만 출력 →
              // globals.css에서 .dark 클래스로 라이트/다크 전환.
              themes: { light: "catppuccin-latte", dark: "catppuccin-mocha" },
              defaultColor: false,
              // 언어 미지정(```)·미지원 코드블록도 plaintext로 토큰화해 .shiki를
              // 입힌다. 이게 없으면 lang 없는 블록은 prose 기본색(밝은 글자)으로
              // 떨어져 라이트 모드 흰 배경에서 글자가 안 보인다.
              defaultLanguage: "plaintext",
              fallbackLanguage: "plaintext",
            },
          ],
        ],
      },
    },
  });

  // 목차: raw 마크다운에서 h2/h3 추출 (id는 rehypeSlug가 부여한 heading id와 일치).
  const toc = extractToc(content);

  // Related posts: 같은 개발 글 안에서 태그 유사도 기반으로 선정.
  const related = rankRelatedPosts(getAllPosts(locale), {
    slug,
    tags: meta.tags,
    category: meta.category,
  }).map((r) => ({
    slug: r.slug,
    title: r.title,
    href: `/${r.hrefLocale}/blog/${r.slug}`,
  }));

  return (
    <>
      <JsonLd
        data={buildBlogPostingSchema({
          path: `blog/${slug}`,
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
            { name: dict.nav.blog, path: "blog" },
            { name: meta.title, path: `blog/${slug}` },
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
        selfHref={(l) => `/${l}/blog/${slug}`}
        related={related}
      />
    </>
  );
}
