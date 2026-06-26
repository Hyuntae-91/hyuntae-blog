import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { hasLocale, getDictionary, type Locale, locales } from "@/lib/i18n";
import { getPost, getAllSlugs, getAllPosts } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TranslationPendingModal } from "@/components/translation-pending-modal";
import { mdxComponents } from "@/components/mdx-components";
import { ViewCounter } from "@/components/view-counter";
import { JsonLd } from "@/components/json-ld";
import { Comments } from "@/components/comments";
import {
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
} from "@/lib/structured-data";
import { buildOpenGraph } from "@/lib/og-meta";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/constants";

// 조회수를 빌드 타임에 박제하지 않고, 60초마다 백그라운드 재생성(ISR)으로 최신화한다.
export const revalidate = 60;

const langNames: Record<string, Record<Locale, string>> = {
  ko: { ko: "한국어", en: "English", ja: "日本語" },
  en: { ko: "한국어", en: "English", ja: "日本語" },
  ja: { ko: "韓国語", en: "English", ja: "日本語" },
};

// "Coming soon" in each language's own language
const comingSoonLabels: Record<Locale, string> = {
  ko: "준비 중",
  en: "Coming soon",
  ja: "準備中",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) return {};

  const post = await getPost(slug, locale);
  if (!post) {
    const fallback = getAllPosts(locale).find((p) => p.slug === slug);
    if (!fallback) return {};
    return { title: fallback.title };
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
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}/blog/${slug}`])
      ),
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

  const post = await getPost(slug, locale);

  // No content at all for this slug (not even ko)
  if (!post) {
    const postSummary = getAllPosts(locale).find((item) => item.slug === slug);
    if (!postSummary) notFound();
    // Show modal-only page that redirects to original language
    return (
      <TranslationPendingModal
        locale={locale}
        originalLocale={postSummary.originalLang}
        slug={slug}
      />
    );
  }

  const dict = await getDictionary(locale);
  const { meta, content } = post;

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
      mdxOptions: { remarkPlugins: [remarkGfm] },
    },
  });

  // Related posts: 태그 유사도(공유 태그 수) 기반, 같은 카테고리는 가산점.
  // 겹치는 태그가 하나도 없으면 제외한다.
  const allPosts = getAllPosts(locale);
  const tagSet = new Set(meta.tags);
  const related = allPosts
    .filter((p) => p.slug !== slug)
    .map((p) => {
      const sharedTags = p.tags.filter((t) => tagSet.has(t)).length;
      const score = sharedTags + (p.category === meta.category ? 0.5 : 0);
      return { post: p, sharedTags, score };
    })
    .filter((item) => item.sharedTags > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.post);

  return (
    <div className="mx-auto max-w-5xl">
      <JsonLd
        data={buildBlogPostingSchema({
          slug,
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
          slug,
          title: meta.title,
          blogLabel: dict.nav.blog,
        })}
      />
      {/* Sidebar Context layout */}
      <div className="flex">
        {/* Left sidebar: metadata */}
        <aside className="hidden w-56 shrink-0 border-r border-border px-6 py-10 lg:block">
          <div className="sticky top-20 space-y-6">
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {dict.post.dateLabel}
              </h4>
              <p className="text-sm">{meta.date}</p>
            </div>
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {dict.post.viewsLabel ?? "조회수"}
              </h4>
              <div className="pt-0.5">
                <ViewCounter slug={slug} label={dict.post.viewsLabel ?? "조회수"} increment={true} initialViews={initialViews} />
              </div>
            </div>
            {meta.category && (
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {dict.post.categoryLabel}
                </h4>
                <Badge variant="secondary">{meta.category}</Badge>
              </div>
            )}
            {meta.tags.length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {dict.post.tagsLabel}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {meta.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {dict.post.languagesLabel}
              </h4>
              <div className="space-y-1.5">
                {locales.map((l) => {
                  const available = meta.availableLocales.includes(l);
                  const isOriginal = l === meta.originalLang;
                  return (
                    <div key={l} className="flex items-center gap-2 text-sm">
                      <span>{langNames[locale]?.[l] ?? l}</span>
                      {isOriginal ? (
                        l === locale ? (
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px]">
                            {dict.post.original}
                          </Badge>
                        ) : (
                          <Link href={`/${l}/blog/${slug}`}>
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] cursor-pointer">
                              {dict.post.original}
                            </Badge>
                          </Link>
                        )
                      ) : available ? (
                        l === locale ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px]">
                            {dict.post.available}
                          </Badge>
                        ) : (
                          <Link href={`/${l}/blog/${slug}`}>
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px] cursor-pointer">
                              {dict.post.available}
                            </Badge>
                          </Link>
                        )
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 text-[10px]">
                          {comingSoonLabels[l]}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {related.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {dict.post.relatedPosts}
                </h4>
                <div className="space-y-2">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/${r.hrefLocale}/blog/${r.slug}`}
                      className="block text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {r.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <article className="flex-1 px-6 py-10 lg:px-12">
          {/* Mobile: translation bar */}
          <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
            {locales.map((l) => {
              const available = meta.availableLocales.includes(l);
              const isOriginal = l === meta.originalLang;
              return isOriginal ? (
                l === locale ? (
                  <Badge key={l} className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                    {dict.post.original}: {langNames[locale]?.[l]}
                  </Badge>
                ) : (
                  <Link key={l} href={`/${l}/blog/${slug}`}>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs cursor-pointer">
                      {dict.post.original}: {langNames[locale]?.[l]}
                    </Badge>
                  </Link>
                )
              ) : available ? (
                l === locale ? (
                  <Badge key={l} className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                    {langNames[locale]?.[l]}
                  </Badge>
                ) : (
                  <Link key={l} href={`/${l}/blog/${slug}`}>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs cursor-pointer">
                      {langNames[locale]?.[l]}
                    </Badge>
                  </Link>
                )
              ) : (
                <Badge key={l} className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 text-xs">
                  {langNames[locale]?.[l]} — {comingSoonLabels[l]}
                </Badge>
              );
            })}
          </div>

          <h1 className="mb-6 text-3xl font-bold leading-tight">
            {meta.title}
          </h1>

          {/* Mobile: meta */}
          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground lg:hidden">
            <span>{meta.date}</span>
            {meta.category && <Badge variant="secondary">{meta.category}</Badge>}
            <span className="text-muted-foreground/30">|</span>
            <ViewCounter slug={slug} label={dict.post.viewsLabel ?? "조회수"} increment={false} initialViews={initialViews} />
          </div>

          <Separator className="mb-8" />

          {/* MDX Content */}
          <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-pre:bg-[#1e1e2e] prose-pre:text-[#cdd6f4]">
            {mdxContent}
          </div>

          <Separator className="my-10" />
          <Comments term={slug} lang={locale} />
        </article>
      </div>
    </div>
  );
}
