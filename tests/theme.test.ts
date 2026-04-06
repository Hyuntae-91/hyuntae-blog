import test from "node:test";
import assert from "node:assert/strict";
import {
  getResolvedTheme,
  isThemeMode,
  type ThemeMode,
} from "../lib/theme.ts";

test("isThemeMode accepts only supported theme modes", () => {
  assert.equal(isThemeMode("light"), true);
  assert.equal(isThemeMode("dark"), true);
  assert.equal(isThemeMode("system"), true);
  assert.equal(isThemeMode("sepia"), false);
});

test("getResolvedTheme resolves system using the current preference", () => {
  assert.equal(getResolvedTheme("system", true), "dark");
  assert.equal(getResolvedTheme("system", false), "light");
});

test("getResolvedTheme preserves explicit theme selections", () => {
  const explicitThemes: ThemeMode[] = ["light", "dark"];

  for (const theme of explicitThemes) {
    assert.equal(getResolvedTheme(theme, true), theme);
    assert.equal(getResolvedTheme(theme, false), theme);
  }
});
