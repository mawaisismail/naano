import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/** Client bound to the throwaway test database, never the dev one. */
export function testClient() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL missing — globalSetup did not run");
  if (!url.includes("naano-test-")) {
    throw new Error(`refusing to run tests against a non-test database: ${url}`);
  }
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}
