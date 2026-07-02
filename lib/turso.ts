import { createClient } from "@libsql/client";

export interface DbExecutor {
  execute(stmt: {
    sql: string;
    args?: Array<string | number | boolean | null>;
  }): Promise<{ rows: Record<string, unknown>[] }>;
}

// 환경변수 값에 개행/공백이 섞여 들어오면(대시보드 복사-붙여넣기 등)
// libSQL 클라이언트가 Authorization 헤더에 넣을 때 invalid header value로
// 빌드가 죽으므로 trim으로 방어한다.
const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!url || !authToken) {
  console.warn("Turso environment variables (TURSO_DATABASE_URL or TURSO_AUTH_TOKEN) are missing. DB stats will not work.");
}

export const turso: DbExecutor | null =
  url && authToken ? createClient({ url, authToken }) : null;
