import test from "node:test";
import assert from "node:assert/strict";
import { rankRelatedPosts } from "../lib/related-posts.ts";
import type { PostMeta } from "../lib/posts.ts";

function makePost(overrides: Partial<PostMeta>): PostMeta {
  return {
    slug: "slug",
    title: "title",
    date: "2026-01-01",
    originalLang: "ko",
    tags: [],
    category: "",
    description: "",
    availableLocales: ["ko"],
    sourceLocale: "ko",
    hrefLocale: "ko",
    isTranslationAvailable: true,
    isDraft: false,
    group: "dev",
    ...overrides,
  };
}

test("rankRelatedPosts ranks by shared tags, then same-category bonus", () => {
  const current = { slug: "a", tags: ["x", "y"], category: "travel" };
  const posts = [
    makePost({ slug: "a", tags: ["x", "y"], category: "travel" }), // self → excluded
    makePost({ slug: "b", tags: ["x"], category: "travel" }), // 1 tag + 0.5 bonus = 1.5
    makePost({ slug: "c", tags: ["x", "y"], category: "music" }), // 2 tags = 2.0
    makePost({ slug: "d", tags: ["z"], category: "travel" }), // 0 shared → excluded
  ];

  const ranked = rankRelatedPosts(posts, current);

  assert.deepEqual(
    ranked.map((p) => p.slug),
    ["c", "b"]
  );
});

test("rankRelatedPosts excludes posts with no shared tags and respects the limit", () => {
  const current = { slug: "a", tags: ["x"], category: "travel" };
  const posts = [
    makePost({ slug: "b", tags: ["x"], category: "travel" }),
    makePost({ slug: "c", tags: ["x"], category: "music" }),
    makePost({ slug: "d", tags: ["x"], category: "music" }),
    makePost({ slug: "e", tags: [], category: "travel" }), // excluded: no shared tag
  ];

  const ranked = rankRelatedPosts(posts, current, 2);

  assert.equal(ranked.length, 2);
  assert.ok(!ranked.some((p) => p.slug === "e"));
});

test("rankRelatedPosts returns empty when nothing shares a tag", () => {
  const current = { slug: "a", tags: ["x"], category: "travel" };
  const posts = [
    makePost({ slug: "b", tags: ["q"], category: "travel" }),
    makePost({ slug: "c", tags: [], category: "travel" }),
  ];

  assert.deepEqual(rankRelatedPosts(posts, current), []);
});
