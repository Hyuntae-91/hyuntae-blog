import { getAllPosts } from "@/lib/posts";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, AUTHOR } from "@/lib/constants";
import { defaultLocale } from "@/lib/locale-helpers";

// AI 크롤러(ChatGPT, Claude, Perplexity 등)에게 사이트 구조와 핵심 글을 알려주는 표준 파일.
// https://llmstxt.org
export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts(defaultLocale);

  const postLines = posts.map(
    (post) =>
      `- [${post.title}](${SITE_URL}/${post.hrefLocale}/blog/${post.slug}): ${post.description}`
  );

  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}. Written by ${AUTHOR.name} (${AUTHOR.jobTitle}).`,
    "",
    "## Blog Posts",
    "",
    ...postLines,
    "",
    "## Pages",
    "",
    `- [Blog](${SITE_URL}/${defaultLocale}/blog): All blog posts.`,
    `- [About](${SITE_URL}/${defaultLocale}/about): About ${AUTHOR.name}, ${AUTHOR.jobTitle}.`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
