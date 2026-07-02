import type { DbExecutor } from "./turso.ts";

export async function getPageViews(db: DbExecutor, slug: string): Promise<number> {
  const result = await db.execute({
    sql: "select views from page_views where slug = ?",
    args: [slug],
  });
  return Number(result.rows[0]?.views ?? 0);
}

export async function incrementPageViews(db: DbExecutor, slug: string): Promise<number> {
  await db.execute({
    sql: "insert into page_views (slug, views, updated_at) values (?, 1, datetime('now')) on conflict(slug) do update set views = views + 1, updated_at = datetime('now')",
    args: [slug],
  });
  return getPageViews(db, slug);
}
