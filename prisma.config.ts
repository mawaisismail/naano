import "dotenv/config";
import { defineConfig } from "prisma/config";
import { resolveDatabaseUrl, resolveDirectDatabaseUrl } from "./src/lib/database-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // No seed. The marketplace is whoever has signed up; a fresh database is
    // legitimately empty, and filling it with invented people would put rows
    // in production that no one can explain.
  },
  datasource: {
    // Vercel Postgres does not set DATABASE_URL, so resolve the same way the
    // app does. Schema pushes use the direct URL: pgbouncer does not support
    // the session-level statements a migration issues.
    url: resolveDirectDatabaseUrl(),
  },
});
