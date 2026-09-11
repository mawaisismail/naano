import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";

/**
 * Vitest globalSetup: build a throwaway Postgres schema from the real schema.
 *
 * Integration tests run against the actual engine that serves production, not
 * a mock and not a different database — a migration that breaks attribution
 * fails the suite, and a query that relies on Postgres semantics is exercised
 * the way it will actually run.
 *
 * Isolation is by Postgres schema rather than by database: the suite creates
 * `naano_test_<random>`, pushes the Prisma schema into it, and drops it on the
 * way out. Nothing outside that schema is ever touched, so pointing this at a
 * database that also holds real data cannot damage it.
 *
 * With no Postgres configured, setup does nothing and the database-backed
 * tests skip themselves. Every pure-logic test still runs.
 */

function baseUrl(): string | null {
  const raw = process.env.TEST_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!raw) return null;
  return /^postgres(ql)?:\/\//i.test(raw) ? raw : null;
}

export function setup() {
  const base = baseUrl();
  if (!base) {
    console.warn(
      "\n[setup-db] No Postgres URL (TEST_DATABASE_URL or DATABASE_URL). " +
        "Database-backed tests will skip.\n"
    );
    return () => {};
  }

  const schema = `naano_test_${randomBytes(6).toString("hex")}`;
  const url = new URL(base);
  url.searchParams.set("schema", schema);
  const testUrl = url.toString();
  process.env.TEST_SCHEMA_URL = testUrl;

  // db push creates the schema if it is absent. No --accept-data-loss: the
  // target schema is brand new, so there is nothing there to lose.
  execSync(`npx prisma db push --url "${testUrl}" --skip-generate`, { stdio: "pipe" });

  return () => {
    delete process.env.TEST_SCHEMA_URL;
    try {
      execSync(
        `npx prisma db execute --url "${testUrl}" --stdin`,
        { input: `DROP SCHEMA IF EXISTS "${schema}" CASCADE;`, stdio: "pipe" }
      );
    } catch {
      // A failed drop leaves one empty schema behind; it must not fail the run.
    }
  };
}
