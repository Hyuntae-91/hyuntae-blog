import test from "node:test";
import assert from "node:assert/strict";
import {
  LIFE_CATEGORIES,
  LIFE_CATEGORY_IDS,
  getCategory,
  isLifeCategory,
  getCategoryLabel,
} from "../lib/categories.ts";
import { locales } from "../lib/locale-helpers.ts";

test("LIFE_CATEGORIES exposes the four hobby categories in order", () => {
  assert.deepEqual(LIFE_CATEGORY_IDS, [
    "travel",
    "music",
    "literature",
    "economy",
  ]);
});

test("getCategory returns the matching category, or undefined", () => {
  assert.equal(getCategory("travel")?.label.ko, "여행");
  assert.equal(getCategory("music")?.group, "life");
  assert.equal(getCategory("does-not-exist"), undefined);
});

test("isLifeCategory validates known ids only", () => {
  assert.equal(isLifeCategory("music"), true);
  assert.equal(isLifeCategory("economy"), true);
  assert.equal(isLifeCategory("backend"), false);
  assert.equal(isLifeCategory(""), false);
});

test("getCategoryLabel localizes, falling back to the raw id", () => {
  assert.equal(getCategoryLabel("economy", "ja"), "経済");
  assert.equal(getCategoryLabel("literature", "en"), "Books");
  assert.equal(getCategoryLabel("unknown", "en"), "unknown");
});

test("every life category has labels and descriptions for all locales", () => {
  for (const category of LIFE_CATEGORIES) {
    for (const locale of locales) {
      assert.ok(
        category.label[locale],
        `${category.id} missing label for ${locale}`
      );
      assert.ok(
        category.description[locale],
        `${category.id} missing description for ${locale}`
      );
    }
    assert.ok(category.icon, `${category.id} missing icon`);
  }
});
