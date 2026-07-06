import test from "node:test";
import assert from "node:assert/strict";
import {
  shouldLoadAnalytics,
  shouldMarkInternalTraffic,
} from "../lib/analytics.ts";

test("shouldMarkInternalTraffic is true only when internal=1", () => {
  assert.equal(
    shouldMarkInternalTraffic(new URLSearchParams("internal=1")),
    true
  );
  assert.equal(
    shouldMarkInternalTraffic(new URLSearchParams("internal=0")),
    false
  );
  assert.equal(
    shouldMarkInternalTraffic(new URLSearchParams("internal=true")),
    false
  );
  assert.equal(shouldMarkInternalTraffic(new URLSearchParams()), false);
});

test("shouldLoadAnalytics requires a GA id and skips internal visitors", () => {
  assert.equal(
    shouldLoadAnalytics({ gaId: "G-TEST123", isInternalVisitor: false }),
    true
  );
  assert.equal(
    shouldLoadAnalytics({ gaId: "G-TEST123", isInternalVisitor: true }),
    false
  );
  assert.equal(
    shouldLoadAnalytics({ gaId: undefined, isInternalVisitor: false }),
    false
  );
  assert.equal(
    shouldLoadAnalytics({ gaId: "", isInternalVisitor: false }),
    false
  );
});
