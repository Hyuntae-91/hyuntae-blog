import { createClient } from "@libsql/client";

export interface DbExecutor {
  execute(stmt: {
    sql: string;
    args?: Array<string | number | boolean | null>;
  }): Promise<{ rows: Record<string, unknown>[] }>;
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.warn("Turso environment variables (TURSO_DATABASE_URL or TURSO_AUTH_TOKEN) are missing. DB stats will not work.");
}

export const turso: DbExecutor | null =
  url && authToken ? createClient({ url, authToken }) : null;
