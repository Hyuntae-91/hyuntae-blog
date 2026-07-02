import type { DbExecutor } from "./turso.ts";

export interface VisitorStats {
  today: number;
  total: number;
}

export async function logVisitor(
  db: DbExecutor,
  params: { date: string; ipHash: string; country: string }
): Promise<void> {
  await db.execute({
    sql: "insert into site_visitors (date, ip_hash, country) values (?, ?, ?) on conflict(date, ip_hash) do nothing",
    args: [params.date, params.ipHash, params.country],
  });
}

export async function getVisitorStats(db: DbExecutor, todayDate: string): Promise<VisitorStats> {
  const result = await db.execute({
    sql: "select (select count(*) from site_visitors where date = ?) as today_count, (select count(*) from site_visitors) as total_count",
    args: [todayDate],
  });
  const row = result.rows[0];
  return {
    today: Number(row?.today_count ?? 0),
    total: Number(row?.total_count ?? 0),
  };
}
