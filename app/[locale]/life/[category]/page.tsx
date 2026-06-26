import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getDictionary, hasLocale, locales, type Locale } from "@/lib/i18n";
import {
  LIFE_CATEGORY_IDS,
  getCategory,
  isLifeCategory,
} from "@/lib/categories";
import { getLifePostsByCategory } from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/constants";
import { buildOpenGraph } from "@/lib/og-meta";

// 새 취미 글이 올라오면 목록이 갱신되도록 ISR. 조회수도 함께 최신화.
export const revalidate = 60;

export function generateStaticParams() {
  const params: { locale: string; category: string }[] = [];
  for (const locale of locales) {
    for (const category of LIFE_CATEGORY_IDS) {
      params.push({ locale, category });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  if (!hasLocale(locale) || !isLifeCategory(category)) return {};
  const def = getCategory(category)!;
  const title = def.label[locale];
  const description = def.description[locale];
  return {
    title,
    description,
    openGraph: buildOpenGraph({
      locale: locale as Locale,
      url: `${SITE_URL}/${locale}/life/${category}`,
      title,
      description,
    }),
    alternates: {
      canonical: `${SITE_URL}/${locale}/life/${category}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}/life/${category}`])
      ),
    },
  };
}

export default async function LifeCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  if (!hasLocale(locale) || !isLifeCategory(category)) notFound();

  const dict = await getDictionary(locale);
  const def = getCategory(category)!;
  const posts = getLifePostsByCategory(locale, category);

  let initialViews: Record<string, number> = {};
  if (supabase) {
    const { data } = await supabase.from("page_views").select("slug, views");
    if (data) {
      initialViews = data.reduce<Record<string, number>>((acc, item) => {
        acc[item.slug] = Number(item.views);
        return acc;
      }, {});
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href={`/${locale}/life`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        {dict.life.hubTitle}
      </Link>
      <h1 className="mb-2 text-2xl font-bold">{def.label[locale]}</h1>
      <p className="mb-8 text-muted-foreground">{def.description[locale]}</p>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">{dict.life.empty}</p>
      ) : (
        <PostList
          posts={posts}
          dict={dict}
          initialViews={initialViews}
          showCategory={false}
          hrefFor={(post) => `/${post.hrefLocale}/life/${category}/${post.slug}`}
        />
      )}
    </div>
  );
}
