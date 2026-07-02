import test from "node:test";
import assert from "node:assert/strict";
import { shouldIncrementView, ONE_DAY_MS } from "../lib/view-tracking.ts";

test("increment flag off never increments, regardless of last view time", () => {
  assert.equal(
    shouldIncrementView({ increment: false, lastViewedAt: null, now: 1000 }),
    false
  );
});

test("first-ever view (no stored timestamp) increments", () => {
  assert.equal(
    shouldIncrementView({ increment: true, lastViewedAt: null, now: 1000 }),
    true
  );
});

test("view within the dedupe window does not increment", () => {
  const now = 1_000_000;
  const lastViewedAt = now - (ONE_DAY_MS - 1);
  assert.equal(
    shouldIncrementView({ increment: true, lastViewedAt, now }),
    false
  );
});

test("view exactly at the window boundary increments", () => {
  const now = 1_000_000;
  const lastViewedAt = now - ONE_DAY_MS;
  assert.equal(
    shouldIncrementView({ increment: true, lastViewedAt, now }),
    true
  );
});

test("view older than the window increments", () => {
  const now = 1_000_000;
  const lastViewedAt = now - ONE_DAY_MS * 2;
  assert.equal(
    shouldIncrementView({ increment: true, lastViewedAt, now }),
    true
  );
});
