import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, locales } from "@/lib/i18n";
import { getAllPosts } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
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
    title: { absolute: "hyuntae's blog" },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}`])
      ),
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const posts = getAllPosts(locale);
  const [featured, ...rest] = posts;

  if (!featured) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center text-muted-foreground">
        {dict.common.emptyPosts}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Magazine Split: Hero */}
      <div className="flex flex-col gap-8 border-b border-border pb-10 md:flex-row md:gap-12">
        {/* Left: Featured post */}
        <div className="flex-[1.5]">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{dict.home.latestPost}</Badge>
            {!featured.isTranslationAvailable && (
              <Badge variant="outline">
                {dict.post.original}: {featured.sourceLocale.toUpperCase()}
              </Badge>
            )}
          </div>
          <Link href={`/${featured.hrefLocale}/blog/${featured.slug}`}>
            <h2 className="mb-3 text-2xl font-bold leading-tight hover:underline md:text-3xl">
              {featured.title}
            </h2>
          </Link>
          <p className="mb-5 leading-relaxed text-muted-foreground">
            {featured.description}
          </p>
          <Link
            href={`/${featured.hrefLocale}/blog/${featured.slug}`}
            className="inline-block rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            {dict.home.readMore} &rarr;
          </Link>
        </div>

        {/* Right: Recent posts list */}
        <div className="flex-1">
          {rest.slice(0, 4).map((post) => (
            <Link
              key={post.slug}
              href={`/${post.hrefLocale}/blog/${post.slug}`}
              className="block border-b border-border py-4 last:border-b-0"
            >
              <span className="text-xs text-muted-foreground">
                {post.date}
              </span>
              <div className="mt-1 flex items-center gap-2">
                <h3 className="text-sm font-semibold leading-snug hover:underline">
                  {post.title}
                </h3>
                {!post.isTranslationAvailable && (
                  <Badge variant="outline" className="text-[10px]">
                    {dict.post.original}: {post.sourceLocale.toUpperCase()}
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* All Posts */}
      {rest.length > 4 && (
        <div className="mt-10">
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {dict.home.allPosts}
          </h3>
          {rest.slice(4).map((post) => (
            <Link
              key={post.slug}
              href={`/${post.hrefLocale}/blog/${post.slug}`}
              className="flex items-center justify-between border-b border-border py-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{post.title}</span>
                {!post.isTranslationAvailable && (
                  <Badge variant="outline" className="text-[10px]">
                    {dict.post.original}: {post.sourceLocale.toUpperCase()}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {post.date}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
