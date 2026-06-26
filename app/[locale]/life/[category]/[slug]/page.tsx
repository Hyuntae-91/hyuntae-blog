import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug";
import { remarkMermaid } from "@/lib/remark-mermaid";
import { extractToc } from "@/lib/toc";
import { hasLocale, getDictionary, type Locale, locales } from "@/lib/i18n";
import { getPost, getLifePosts } from "@/lib/posts";
import { rankRelatedPosts } from "@/lib/related-posts";
import { getCategory, isLifeCategory } from "@/lib/categories";
import { TranslationPendingModal } from "@/components/translation-pending-modal";
import { mdxComponents } from "@/components/mdx-components";
import { PostView } from "@/components/post-view";
import { JsonLd } from "@/components/json-ld";
import {
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
} from "@/lib/structured-data";
import { buildOpenGraph } from "@/lib/og-meta";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/constants";

// 조회수를 60초마다 백그라운드 재생성(ISR)으로 최신화한다.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, category, slug } = await params;
  if (!hasLocale(locale) || !isLifeCategory(category)) return {};

  const post = await getPost(slug, locale, "life");
  if (!post) {
    const fallback = getLifePosts(locale).find((p) => p.slug === slug);
    if (!fallback) return {};
    return { title: fallback.title };
  }

  const { meta } = post;
  const base = `life/${category}/${slug}`;
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
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}/${base}`])
      ),
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

  const post = await getPost(slug, locale, "life");

  // 이 슬러그에 대한 콘텐츠가 (ko조차) 없으면 404.
  if (!post) {
    const summary = getLifePosts(locale).find((item) => item.slug === slug);
    if (!summary) notFound();
    // 번역 준비 중 → 원본 언어의 취미 글로 유도.
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

  let initialViews = 0;
  if (supabase) {
    const { data } = await supabase
      .from("page_views")
      .select("views")
      .eq("slug", slug)
      .single();
    if (data) {
      initialViews = Number(data.views);
    }
  }

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
      />
    </>
  );
}
