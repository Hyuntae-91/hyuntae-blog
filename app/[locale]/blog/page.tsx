import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, locales, type Locale } from "@/lib/i18n";
import { getAllPosts } from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { SITE_URL } from "@/lib/constants";
import { buildOpenGraph } from "@/lib/og-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.nav.blog,
    openGraph: buildOpenGraph({
      locale: locale as Locale,
      url: `${SITE_URL}/${locale}/blog`,
    }),
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}/blog`])
      ),
      types: {
        "application/rss+xml": `${SITE_URL}/${locale}/feed.xml`,
      },
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const posts = getAllPosts(locale);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-bold">{dict.nav.blog}</h1>
      <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
        {dict.home.tagline}
      </p>
      {posts.length === 0 && (
        <p className="text-muted-foreground">{dict.common.emptyPosts}</p>
      )}
      <PostList posts={posts} dict={dict} />
    </div>
  );
}
