import { createRequire } from "node:module";
import { isPostgresUrl } from "@/lib/database-url";

const require = createRequire(import.meta.url);

/**
 * Build the Prisma driver adapter for a connection URL.
 *
 * The two drivers are required lazily, not imported at the top of the file, so
 * a Postgres deployment never loads better-sqlite3. That matters: better-sqlite3
 * is a native module, and bundling it into a serverless function either bloats
 * the bundle or fails outright when the prebuilt binary does not match the
 * runtime. Vercel also blocks install scripts by default, so its native build
 * may never have run at all.
 */
export function makeAdapter(url: string) {
  if (isPostgresUrl(url)) {
    const { PrismaPg } = require("@prisma/adapter-pg");
    return new PrismaPg({ connectionString: url });
  }

  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  return new PrismaBetterSqlite3({ url });
}
