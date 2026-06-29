import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ViewCounter } from "@/components/view-counter";
import { Comments } from "@/components/comments";
import { TableOfContents } from "@/components/toc";
import type { TocItem } from "@/lib/toc";
import { locales, type Locale } from "@/lib/locale-helpers";
import { formatPostDate } from "@/lib/date";

const langNames: Record<string, Record<Locale, string>> = {
  ko: { ko: "한국어", en: "English", ja: "日本語" },
  en: { ko: "한국어", en: "English", ja: "日本語" },
  ja: { ko: "韓国語", en: "English", ja: "日本語" },
};

// 한·영·일 모두 "Coming Soon"으로 통일해 노출한다(현지화하지 않음).
const comingSoonLabels: Record<Locale, string> = {
  ko: "Coming Soon",
  en: "Coming Soon",
  ja: "Coming Soon",
};

export interface PostViewMeta {
  title: string;
  date: string;
  category: string;
  tags: string[];
  availableLocales: Locale[];
  originalLang: Locale;
}

export interface RelatedPostLink {
  slug: string;
  title: string;
  href: string;
}

export interface PostViewDict {
  post: {
    dateLabel: string;
    viewsLabel?: string;
    categoryLabel: string;
    tagsLabel: string;
    languagesLabel: string;
    relatedPosts: string;
    contents: string;
    original: string;
    available: string;
  };
}

interface PostViewProps {
  slug: string;
  locale: Locale;
  meta: PostViewMeta;
  content: ReactNode;
  toc: TocItem[];
  initialViews: number;
  dict: PostViewDict;
  // 글의 로케일별 URL을 만든다. 개발(/blog/[slug])과 취미(/life/[category]/[slug])가
  // 경로가 달라 호출부에서 주입한다.
  selfHref: (locale: Locale) => string;
  // 카테고리 배지를 클릭 가능한 링크로 만들 때 사용(선택). 없으면 정적 배지.
  categoryHref?: string;
  categoryLabel?: string;
  related: RelatedPostLink[];
}

// 개발·취미 글 상세의 공용 레이아웃. 좌측 메타 사이드바 + 본문 + 우측 목차.
export function PostView({
  slug,
  locale,
  meta,
  content,
  toc,
  initialViews,
  dict,
  selfHref,
  categoryHref,
  categoryLabel,
  related,
}: PostViewProps) {
  const viewsLabel = dict.post.viewsLabel ?? "조회수";
  const displayCategory = categoryLabel ?? meta.category;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex">
        {/* Left sidebar: metadata */}
        <aside className="hidden w-56 shrink-0 border-r border-border px-6 py-10 lg:block">
          <div className="sticky top-20 space-y-6">
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {dict.post.dateLabel}
              </h4>
              <p className="text-sm">{formatPostDate(meta.date)}</p>
            </div>
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {viewsLabel}
              </h4>
              <div className="pt-0.5">
                <ViewCounter
                  slug={slug}
                  label={viewsLabel}
                  increment={true}
                  initialViews={initialViews}
                />
              </div>
            </div>
            {meta.category && (
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {dict.post.categoryLabel}
                </h4>
                {categoryHref ? (
                  <Link href={categoryHref}>
                    <Badge variant="secondary" className="cursor-pointer">
                      {displayCategory}
                    </Badge>
                  </Link>
                ) : (
                  <Badge variant="secondary">{displayCategory}</Badge>
                )}
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
                          <Link href={selfHref(l)}>
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
                          <Link href={selfHref(l)}>
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
                      href={r.href}
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
        <article className="flex-1 min-w-0 px-6 py-10 lg:px-12">
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
                  <Link key={l} href={selfHref(l)}>
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
                  <Link key={l} href={selfHref(l)}>
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

          <h1 className="mb-6 text-3xl font-bold leading-tight">{meta.title}</h1>

          {/* Mobile: meta */}
          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground lg:hidden">
            <span>{formatPostDate(meta.date)}</span>
            {meta.category && (
              <Badge variant="secondary">{displayCategory}</Badge>
            )}
            <span className="text-muted-foreground/30">|</span>
            <ViewCounter
              slug={slug}
              label={viewsLabel}
              increment={false}
              initialViews={initialViews}
            />
          </div>

          <Separator className="mb-8" />

          {/* Mobile: TOC (접이식) */}
          {toc.length > 0 && (
            <details className="mb-8 rounded-lg border border-border p-4 lg:hidden">
              <summary className="cursor-pointer text-sm font-semibold">
                {dict.post.contents}
              </summary>
              <ul className="mt-3 space-y-1.5 text-sm">
                {toc.map((item) => (
                  <li key={item.id} className={item.depth === 3 ? "pl-4" : ""}>
                    <a
                      href={`#${item.id}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {/* MDX Content */}
          <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-pre:bg-transparent prose-pre:p-0">
            {content}
          </div>

          <Separator className="my-10" />
          <Comments term={slug} lang={locale} />
        </article>

        {/* Right sidebar: TOC (desktop) */}
        {toc.length > 0 && (
          <aside className="hidden w-56 shrink-0 px-6 py-10 lg:block">
            <div className="sticky top-20">
              <TableOfContents items={toc} label={dict.post.contents} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
