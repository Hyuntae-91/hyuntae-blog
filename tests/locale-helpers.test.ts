import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultLocale,
  detectPreferredLocale,
  getLocaleFontClass,
  replacePathLocale,
  resolvePostHrefLocale,
  resolvePostSourceLocale,
} from "../lib/locale-helpers.ts";

test("detectPreferredLocale prioritizes cookie over other signals", () => {
  const locale = detectPreferredLocale({
    cookieLocale: "ja",
    country: "KR",
    acceptLanguage: "ko-KR,ko;q=0.9,en;q=0.8",
  });

  assert.equal(locale, "ja");
});

test("detectPreferredLocale falls back through country, language, then default", () => {
  assert.equal(
    detectPreferredLocale({
      country: "JP",
      acceptLanguage: "en-US,en;q=0.9",
    }),
    "ja"
  );

  assert.equal(
    detectPreferredLocale({
      acceptLanguage: "ko-KR,ko;q=0.9,en;q=0.8",
    }),
    "ko"
  );

  assert.equal(
    detectPreferredLocale({
      acceptLanguage: "fr-FR,fr;q=0.9",
    }),
    defaultLocale
  );
});

test("replacePathLocale replaces an existing locale segment", () => {
  assert.equal(replacePathLocale("/en/blog/git-branch-strategy", "ja"), "/ja/blog/git-branch-strategy");
});

test("replacePathLocale injects a locale when the pathname has none", () => {
  assert.equal(replacePathLocale("/blog", "ko"), "/ko/blog");
  assert.equal(replacePathLocale("/", "en"), "/en");
});

test("resolvePostSourceLocale prefers the requested locale when available", () => {
  assert.equal(
    resolvePostSourceLocale({
      requestedLocale: "en",
      availableLocales: ["ko", "en"],
      originalLocale: "ko",
    }),
    "en"
  );
});

test("resolvePostSourceLocale falls back to the original locale when translation is missing", () => {
  assert.equal(
    resolvePostSourceLocale({
      requestedLocale: "ja",
      availableLocales: ["ko"],
      originalLocale: "ko",
    }),
    "ko"
  );
});

test("resolvePostHrefLocale sends untranslated entries to the original locale route", () => {
  assert.equal(
    resolvePostHrefLocale({
      requestedLocale: "ja",
      availableLocales: ["ko"],
      originalLocale: "ko",
    }),
    "ko"
  );
});

test("getLocaleFontClass returns the expected locale-specific font class", () => {
  assert.equal(getLocaleFontClass("ko"), "font-locale-ko");
  assert.equal(getLocaleFontClass("en"), "font-locale-en");
  assert.equal(getLocaleFontClass("ja"), "font-locale-ja");
});
