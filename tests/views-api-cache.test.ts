import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routeSource = readFileSync("app/api/views/[slug]/route.ts", "utf8");
const counterSource = readFileSync("components/view-counter.tsx", "utf8");

test("views API route declares dynamic no-store behavior", () => {
  assert.match(routeSource, /dynamic\s*=\s*["']force-dynamic["']/);
  assert.match(routeSource, /["']Cache-Control["']\s*:\s*["']no-store["']/);
});

test("view counter fetches both GET and POST paths without cache", () => {
  assert.match(counterSource, /method:\s*["']POST["'],\s*cache:\s*["']no-store["']/);
  assert.match(counterSource, /cache:\s*["']no-store["']/);
});
