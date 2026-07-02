import test from "node:test";
import assert from "node:assert/strict";
import { logVisitor, getVisitorStats } from "../lib/visitor-stats.ts";

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

test("logVisitor inserts a row with date, ip hash, and country", async () => {
  const db = createFakeDb();
  await logVisitor(db, { date: "2026-07-02", ipHash: "abc123", country: "KR" });

  assert.equal(db.calls.length, 1);
  assert.match(db.calls[0].sql, /insert into site_visitors/i);
  assert.deepEqual(db.calls[0].args, ["2026-07-02", "abc123", "KR"]);
});

test("logVisitor relies on ON CONFLICT DO NOTHING to dedupe same-day IPs", async () => {
  const db = createFakeDb();
  await logVisitor(db, { date: "2026-07-02", ipHash: "abc123", country: "KR" });

  assert.match(db.calls[0].sql, /on conflict\(date, ip_hash\) do nothing/i);
});

test("getVisitorStats reads today and total counts from the query result", async () => {
  const db = createFakeDb([{ today_count: 3, total_count: 150 }]);
  const stats = await getVisitorStats(db, "2026-07-02");

  assert.deepEqual(stats, { today: 3, total: 150 });
  assert.deepEqual(db.calls[0].args, ["2026-07-02"]);
});

test("getVisitorStats returns zeros when the query returns no rows", async () => {
  const db = createFakeDb([]);
  const stats = await getVisitorStats(db, "2026-07-02");

  assert.deepEqual(stats, { today: 0, total: 0 });
});
