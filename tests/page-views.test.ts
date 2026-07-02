import test from "node:test";
import assert from "node:assert/strict";
import { getPageViews, incrementPageViews } from "../lib/page-views.ts";

function createFakeDb(rows: Record<string, unknown>[] = []) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    execute: async (stmt: { sql: string; args?: unknown[] }) => {
      calls.push({ sql: stmt.sql, args: stmt.args ?? [] });
      return { rows };
    },
  };
}

test("getPageViews returns 0 for a slug with no recorded views", async () => {
  const db = createFakeDb([]);
  assert.equal(await getPageViews(db, "unknown-slug"), 0);
});

test("getPageViews returns the recorded view count for a slug", async () => {
  const db = createFakeDb([{ views: 42 }]);
  assert.equal(await getPageViews(db, "some-post"), 42);
  assert.deepEqual(db.calls[0].args, ["some-post"]);
});

test("incrementPageViews upserts the slug then returns the updated count", async () => {
  const calls: { sql: string; args: unknown[] }[] = [];
  const db = {
    execute: async (stmt: { sql: string; args?: unknown[] }) => {
      calls.push({ sql: stmt.sql, args: stmt.args ?? [] });
      if (/insert into page_views/i.test(stmt.sql)) {
        return { rows: [] };
      }
      return { rows: [{ views: 8 }] };
    },
  };

  const result = await incrementPageViews(db, "some-post");

  assert.equal(result, 8);
  assert.match(calls[0].sql, /on conflict\(slug\) do update set views = views \+ 1/i);
});
