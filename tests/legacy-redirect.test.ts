import test from "node:test";
import assert from "node:assert/strict";
import { SITE_URL, resolveLegacyRedirect } from "../lib/constants.ts";

const canonicalHost = new URL(SITE_URL).host;

test("legacy vercel host redirects to canonical domain, preserving path and query", () => {
  const target = resolveLegacyRedirect(
    "hyuntae-blog.vercel.app",
    "/ko/blog/opensearch-search-optimization?ref=x"
  );

  assert.equal(
    target,
    `${SITE_URL}/ko/blog/opensearch-search-optimization?ref=x`
  );
});

test("legacy host root path redirects to canonical root", () => {
  assert.equal(resolveLegacyRedirect("hyuntae-blog.vercel.app", "/"), `${SITE_URL}/`);
});

test("canonical and other custom hosts are not redirected", () => {
  assert.equal(resolveLegacyRedirect(canonicalHost, "/ko"), null);
  assert.equal(resolveLegacyRedirect("k3nta.com", "/ko"), null);
});

test("preview deployments and localhost are not redirected", () => {
  assert.equal(resolveLegacyRedirect("blog-git-feat-abc.vercel.app", "/ko"), null);
  assert.equal(resolveLegacyRedirect("localhost:3000", "/ko"), null);
});

test("missing host returns null", () => {
  assert.equal(resolveLegacyRedirect(null, "/ko"), null);
});
