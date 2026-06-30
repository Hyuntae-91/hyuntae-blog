import test from "node:test";
import assert from "node:assert/strict";
import {
  buildLocalizedPostEntries,
  latestPostDate,
} from "../lib/sitemap-entries.ts";

test("buildLocalizedPostEntries emits one URL per available locale only", () => {
  const entries = buildLocalizedPostEntries(
    [
      { slug: "a", availableLocales: ["ko"], date: "2026-01-01" },
      { slug: "b", availableLocales: ["ko", "en", "ja"], date: "2026-02-02" },
    ],
    (post, locale) => `https://x.com/${locale}/blog/${post.slug}`,
    { changeFrequency: "monthly", priority: 0.6 }
  );

  // a → ko 1개, b → ko/en/ja 3개
  assert.equal(entries.length, 4);
  // 번역이 없는 로케일 URL은 절대 들어가면 안 된다(번역 준비 중 페이지 색인 방지).
  assert.ok(!entries.some((e) => e.url === "https://x.com/en/blog/a"));
  assert.ok(!entries.some((e) => e.url === "https://x.com/ja/blog/a"));
  assert.ok(entries.some((e) => e.url === "https://x.com/ko/blog/a"));
  assert.ok(entries.some((e) => e.url === "https://x.com/en/blog/b"));
});

test("buildLocalizedPostEntries stamps lastModified with the post date, not build time", () => {
  const entries = buildLocalizedPostEntries(
    [{ slug: "a", availableLocales: ["ko"], date: "2026-04-06T23:27:01+09:00" }],
    (post, locale) => `https://x.com/${locale}/blog/${post.slug}`,
    { changeFrequency: "monthly", priority: 0.6 }
  );

  assert.equal(entries.length, 1);
  assert.equal(
    (entries[0].lastModified as Date).getTime(),
    new Date("2026-04-06T23:27:01+09:00").getTime()
  );
});

test("buildLocalizedPostEntries carries changeFrequency and priority through", () => {
  const entries = buildLocalizedPostEntries(
    [{ slug: "a", availableLocales: ["ko"], date: "2026-01-01" }],
    (post, locale) => `https://x.com/${locale}/${post.slug}`,
    { changeFrequency: "weekly", priority: 0.4 }
  );

  assert.equal(entries[0].changeFrequency, "weekly");
  assert.equal(entries[0].priority, 0.4);
});

test("latestPostDate returns the most recent valid date", () => {
  const result = latestPostDate([
    { date: "2026-01-01" },
    { date: "2026-06-25T23:45:21+09:00" },
    { date: "2026-03-15" },
  ]);

  assert.equal(result?.getTime(), new Date("2026-06-25T23:45:21+09:00").getTime());
});

test("latestPostDate ignores unparseable dates and returns undefined when empty", () => {
  assert.equal(latestPostDate([]), undefined);
  assert.equal(latestPostDate([{ date: "not-a-date" }]), undefined);

  const result = latestPostDate([{ date: "nope" }, { date: "2026-02-02" }]);
  assert.equal(result?.getTime(), new Date("2026-02-02").getTime());
});
