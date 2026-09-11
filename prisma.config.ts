import "dotenv/config";
import { defineConfig } from "prisma/config";
import { resolveDatabaseUrl, resolveDirectDatabaseUrl } from "./src/lib/database-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Vercel Postgres does not set DATABASE_URL, so resolve the same way the
    // app does. Schema pushes use the direct URL: pgbouncer does not support
    // the session-level statements a migration issues.
    url: resolveDirectDatabaseUrl(),
  },
});
