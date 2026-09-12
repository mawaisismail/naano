#!/usr/bin/env node
/**
 * Prepare the database during a deployment build.
 *
 * Runs only when the resolved URL is Postgres, so local builds are untouched.
 *
 *   1. apply the migrations (creates the tables; without this every page 500s
 *      with P2021 "table does not exist")
 *   2. report how many users exist, so a deploy log says what it landed on
 *
 */
import "dotenv/config";
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

// A build on a developer's machine must not require a running database: the
// compile step does not query anything. On a host it must, because a deploy
// that skips the schema push serves 500s from every page.
const onHost = Boolean(
  process.env.CI || process.env.VERCEL || process.env.GITHUB_ACTIONS
);

// Schema changes must not go through pgbouncer; it does not support the
// session-level statements they issue.
const migrateUrl = direct || appUrl;

const run = (cmd, url) =>
  execSync(cmd, {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });

console.log("[deploy-db] applying migrations…");
try {
  // migrate deploy, not db push: it applies the versioned migrations in
  // prisma/migrations in order and refuses to invent a schema change nobody
  // reviewed. db push is for prototyping and will silently drop a column.
  run("npx prisma migrate deploy", migrateUrl);
} catch (err) {
  if (onHost) throw err;
  console.log(
    "[deploy-db] database unreachable — skipping (local build).\n" +
      "            Start Postgres and run `npm run db:push` before `npm run dev`."
  );
  process.exit(0);
}

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

// Nothing is written. There is no seed: the marketplace is whoever has signed
// up, so an empty database is a correct state and not one to paper over.
console.log(`[deploy-db] existing users: ${userCount}`);
console.log("[deploy-db] schema up to date; no seed to run");
