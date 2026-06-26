import { getAllPosts } from "@/lib/posts";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { locales, hasLocale } from "@/lib/locale-helpers";

// 로케일별 RSS 2.0 피드. 네이버 웹마스터의 RSS 제출, 구글/일반 RSS 리더 구독에 사용된다.
export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// title/description에 들어갈 수 있는 특수문자를 안전하게 처리한다.
function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  if (!hasLocale(locale)) {
    return new Response("Not found", { status: 404 });
  }

  const posts = getAllPosts(locale);
  const feedUrl = `${SITE_URL}/${locale}/feed.xml`;
  const homeUrl = `${SITE_URL}/${locale}`;
  const lastBuildDate = (
    posts[0]?.date ? new Date(posts[0].date) : new Date(0)
  ).toUTCString();

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/${post.hrefLocale}/blog/${post.slug}`;
      const pubDate = post.date ? new Date(post.date).toUTCString() : "";
      return [
        "    <item>",
        `      <title>${cdata(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        pubDate ? `      <pubDate>${pubDate}</pubDate>` : "",
        post.category ? `      <category>${cdata(post.category)}</category>` : "",
        `      <description>${cdata(post.description)}</description>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${cdata(SITE_NAME)}</title>
    <link>${homeUrl}</link>
    <description>${cdata(SITE_DESCRIPTION)}</description>
    <language>${locale}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
