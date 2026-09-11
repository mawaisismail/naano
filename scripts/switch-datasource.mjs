#!/usr/bin/env node
/**
 * Flip prisma/schema.prisma between sqlite and postgresql.
 *
 * The datasource provider is a static string in the schema — it cannot be read
 * from an env var — so switching databases needs this one edit. The driver
 * adapter in src/lib/db.ts already picks itself from DATABASE_URL, and no query
 * in the app changes.
 *
 *   npm run use:postgres    # before deploying
 *   npm run use:sqlite      # back to local development
 */
import { readFileSync, writeFileSync } from "node:fs";

let target = process.argv[2];

// `auto` derives the provider from DATABASE_URL. The build runs this, so a
// deployment with a Postgres URL cannot ship a schema still saying sqlite —
// which is a confusing failure that happens at connect time, not build time.
if (target === "auto") {
  // Must match src/lib/database-url.ts. Vercel Postgres sets POSTGRES_* rather
  // than DATABASE_URL, and reading only the latter would build a sqlite schema
  // against a Postgres database.
  const pg = /^postgres(ql)?:\/\//i;
  const explicit = (process.env.DATABASE_URL ?? "").trim();
  const vercel =
    (process.env.POSTGRES_PRISMA_URL ?? "").trim() ||
    (process.env.POSTGRES_URL ?? "").trim() ||
    (process.env.POSTGRES_URL_NON_POOLING ?? "").trim();

  // Same precedence as src/lib/database-url.ts: a managed Postgres URL beats a
  // local SQLite DATABASE_URL loaded from .env.
  const url = explicit && pg.test(explicit) ? explicit : vercel || explicit;
  target = /^postgres(ql)?:\/\//i.test(url) ? "postgresql" : "sqlite";
}

if (target !== "sqlite" && target !== "postgresql") {
  console.error("usage: node scripts/switch-datasource.mjs <sqlite|postgresql|auto>");
  process.exit(1);
}

const path = "prisma/schema.prisma";
const src = readFileSync(path, "utf8");
const next = src.replace(
  /(datasource db \{\s*\n\s*provider\s*=\s*)"[^"]+"/,
  `$1"${target}"`
);

if (next === src) {
  console.log(`schema already targets ${target}, nothing to do`);
  process.exit(0);
}

writeFileSync(path, next);
console.log(`schema now targets ${target}`);
console.log(
  target === "postgresql"
    ? "next: set DATABASE_URL to your Postgres URL, then `npx prisma db push` and `npm run db:seed`"
    : "next: `npm run db:push` and `npm run db:seed`"
);
