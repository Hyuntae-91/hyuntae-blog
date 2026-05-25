import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, locales } from "@/lib/i18n";
import { getAllPosts } from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { SITE_URL } from "@/lib/constants";

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
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}/blog`])
      ),
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
      <h1 className="mb-8 text-2xl font-bold">{dict.nav.blog}</h1>
      {posts.length === 0 && (
        <p className="text-muted-foreground">{dict.common.emptyPosts}</p>
      )}
      <PostList posts={posts} dict={dict} />
    </div>
  );
}
