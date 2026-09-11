import { execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Vitest globalSetup: build a throwaway SQLite database from the real schema.
 *
 * Integration tests run against the actual schema rather than a mock, so a
 * migration that breaks attribution fails the suite. The dev database is never
 * touched — a wrong DATABASE_URL here would wipe seeded demo data.
 */
let dir: string;

export function setup() {
  dir = mkdtempSync(join(tmpdir(), "naano-test-"));
  const url = `file:${join(dir, "test.db")}`;
  process.env.TEST_DATABASE_URL = url;

  // Tests always run on SQLite. Building for deployment rewrites the schema to
  // postgresql and regenerates the client for it, and a client generated for
  // postgres refuses a sqlite adapter — so a test run straight after a
  // production build would fail for a reason that has nothing to do with the
  // code under test. Force the provider and regenerate first.
  execSync("node scripts/switch-datasource.mjs sqlite", { stdio: "pipe" });
  execSync("npx prisma generate", {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "pipe",
  });

  // Prisma 7's db push takes --url. No --accept-data-loss: the target is a
  // freshly created empty file, so there is nothing to lose, and that flag is
  // gated behind an explicit-consent env var.
  execSync(`npx prisma db push --url "${url}"`, {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "pipe",
  });

  return () => {
    rmSync(dir, { recursive: true, force: true });
  };
}
