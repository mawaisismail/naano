#!/usr/bin/env node
/**
 * Prepare the database during a deployment build.
 *
 * Runs only when the resolved URL is Postgres, so local builds are untouched.
 *
 *   1. push the schema (creates the tables; without this every page 500s with
 *      P2021 "table does not exist")
 *   2. seed ONLY when the database is empty
 *
 * Step 2 is guarded on purpose. The seed clears the mutable tables before
 * writing, so running it on every deploy would wipe whatever a reviewer had
 * just done — accepted an offer, advanced a deal, generated clicks — every time
 * a commit landed. Empty means fresh, so seed; otherwise leave it alone.
 */
import { execSync } from "node:child_process";

const pg = /^postgres(ql)?:\/\//i;

const explicit = (process.env.DATABASE_URL ?? "").trim();
const pooled =
  (process.env.POSTGRES_PRISMA_URL ?? "").trim() ||
  (process.env.POSTGRES_URL ?? "").trim();
const direct =
  (process.env.POSTGRES_URL_NON_POOLING ?? "").trim() ||
  (process.env.DIRECT_DATABASE_URL ?? "").trim();

const appUrl = explicit && pg.test(explicit) ? explicit : pooled || explicit;

if (!pg.test(appUrl)) {
  console.log("[deploy-db] not a Postgres target — skipping (local build)");
  process.exit(0);
}

// Schema changes must not go through pgbouncer; it does not support the
// session-level statements they issue.
const migrateUrl = direct || appUrl;

const run = (cmd, url) =>
  execSync(cmd, {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });

console.log("[deploy-db] pushing schema…");
run("npx prisma db push", migrateUrl);

console.log("[deploy-db] checking whether the database is empty…");
let userCount = null;
try {
  const out = execSync("npx tsx scripts/count-users.mts", {
    env: { ...process.env, DATABASE_URL: migrateUrl },
    encoding: "utf8",
  });
  // Take the LAST numeric line. Parse it as a number rather than matching on
  // the string: `endsWith("0")` is also true for "10" and "20", which would
  // treat a populated database as empty and wipe a reviewer's work.
  const last = out
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^\d+$/.test(l))
    .pop();
  if (last === undefined) throw new Error(`no count in output: ${out.trim()}`);
  userCount = Number(last);
} catch (err) {
  console.error("[deploy-db] could not count users:", err.message);
  process.exit(1);
}

// Only a genuinely empty database gets seeded. Anything else is left alone,
// because the seed clears tables before writing.
const isEmpty = userCount === 0;
console.log(`[deploy-db] existing users: ${userCount}`);

if (isEmpty) {
  console.log("[deploy-db] empty database — seeding demo data");
  run("npx tsx prisma/seed.ts", migrateUrl);
} else {
  console.log("[deploy-db] database already has data — leaving it alone");
}
