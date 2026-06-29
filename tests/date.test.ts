import test from "node:test";
import assert from "node:assert/strict";
import { formatPostDate, comparePostsByDateDesc } from "../lib/date.ts";

test("formatPostDate strips time from a datetime string", () => {
  assert.equal(formatPostDate("2026-06-29T14:30:00+09:00"), "2026-06-29");
});

test("formatPostDate keeps a date-only string unchanged", () => {
  assert.equal(formatPostDate("2026-06-29"), "2026-06-29");
});

test("formatPostDate returns empty string for empty input", () => {
  assert.equal(formatPostDate(""), "");
});

test("comparePostsByDateDesc puts the more recent date first", () => {
  const older = { date: "2026-06-25", slug: "a" };
  const newer = { date: "2026-06-29", slug: "b" };
  assert.ok(comparePostsByDateDesc(newer, older) < 0);
  assert.ok(comparePostsByDateDesc(older, newer) > 0);
});

test("comparePostsByDateDesc breaks same-day ties by time (later first)", () => {
  const earlier = { date: "2026-06-28T19:00:00+09:00", slug: "a" };
  const later = { date: "2026-06-28T21:00:00+09:00", slug: "b" };
  assert.ok(comparePostsByDateDesc(later, earlier) < 0);
});

test("comparePostsByDateDesc breaks identical-instant ties by slug ascending", () => {
  const first = { date: "2026-06-28T20:00:00+09:00", slug: "journey-1" };
  const second = { date: "2026-06-28T20:00:00+09:00", slug: "journey-2" };
  assert.ok(comparePostsByDateDesc(first, second) < 0);
});

test("comparePostsByDateDesc keeps a series in order when sorting a mixed list", () => {
  const posts = [
    { date: "2026-04-06", slug: "opensearch" },
    { date: "2026-06-28T19:00:00+09:00", slug: "journey-4" },
    { date: "2026-06-28T20:00:00+09:00", slug: "journey-3" },
    { date: "2026-06-28T21:00:00+09:00", slug: "journey-2" },
    { date: "2026-06-29T21:00:00+09:00", slug: "journey-1" },
    { date: "2026-06-25", slug: "mysql" },
  ];
  const sorted = [...posts].sort(comparePostsByDateDesc).map((p) => p.slug);
  assert.deepEqual(sorted, [
    "journey-1",
    "journey-2",
    "journey-3",
    "journey-4",
    "mysql",
    "opensearch",
  ]);
});
