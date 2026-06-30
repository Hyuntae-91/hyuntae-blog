import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPendingTranslationMetadata,
  buildPostLanguageAlternates,
} from "../lib/post-metadata.ts";

const BASE = "https://example.com";

test("buildPendingTranslationMetadata blocks indexing of a not-yet-translated post", () => {
  const meta = buildPendingTranslationMetadata({
    baseUrl: BASE,
    title: "제목",
    path: "blog/foo",
    originalLang: "ko",
  });

  // 번역 준비 중 페이지는 검색엔진에 색인되면 안 된다.
  assert.deepEqual(meta.robots, { index: false, follow: false });
});

test("buildPendingTranslationMetadata canonicalizes to the original-language URL, not the requested locale", () => {
  const meta = buildPendingTranslationMetadata({
    baseUrl: BASE,
    title: "제목",
    path: "blog/foo",
    originalLang: "ko",
  });

  // canonical은 원문 URL로 신호를 모은다(루트 레이아웃 기본 canonical로 새지 않도록).
  assert.equal(meta.alternates?.canonical, `${BASE}/ko/blog/foo`);
  assert.equal(meta.title, "제목");
});

test("buildPostLanguageAlternates exposes only locales that actually have a translation", () => {
  const languages = buildPostLanguageAlternates({
    baseUrl: BASE,
    path: "blog/foo",
    availableLocales: ["ko"],
    originalLang: "ko",
  });

  // 번역이 없는 en/ja는 hreflang에 절대 들어가면 안 된다.
  assert.equal(languages.ko, `${BASE}/ko/blog/foo`);
  assert.equal(languages.en, undefined);
  assert.equal(languages.ja, undefined);
});

test("buildPostLanguageAlternates lists every available locale and an x-default pointing to the original", () => {
  const languages = buildPostLanguageAlternates({
    baseUrl: BASE,
    path: "blog/foo",
    availableLocales: ["ko", "en", "ja"],
    originalLang: "ko",
  });

  assert.equal(languages.ko, `${BASE}/ko/blog/foo`);
  assert.equal(languages.en, `${BASE}/en/blog/foo`);
  assert.equal(languages.ja, `${BASE}/ja/blog/foo`);
  // x-default는 항상 원문 로케일로.
  assert.equal(languages["x-default"], `${BASE}/ko/blog/foo`);
});

test("post-metadata helpers work for nested life paths too (shared by blog and life)", () => {
  const meta = buildPendingTranslationMetadata({
    baseUrl: BASE,
    title: "여행",
    path: "life/travel/bar",
    originalLang: "ja",
  });
  assert.equal(meta.alternates?.canonical, `${BASE}/ja/life/travel/bar`);

  const languages = buildPostLanguageAlternates({
    baseUrl: BASE,
    path: "life/travel/bar",
    availableLocales: ["ja", "en"],
    originalLang: "ja",
  });
  assert.equal(languages.ja, `${BASE}/ja/life/travel/bar`);
  assert.equal(languages.en, `${BASE}/en/life/travel/bar`);
  assert.equal(languages.ko, undefined);
  assert.equal(languages["x-default"], `${BASE}/ja/life/travel/bar`);
});
