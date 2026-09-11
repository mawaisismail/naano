import { describe, it, expect } from "vitest";
import {
  resolveDatabaseUrl,
  resolveDirectDatabaseUrl,
  isPostgresUrl,
} from "./database-url";

const PG = "postgres://u:p@host/db";
const POOLED = "postgres://u:p@pooler/db?pgbouncer=true";
const DIRECT = "postgres://u:p@direct/db";

describe("resolving the database URL", () => {
  it("throws when nothing is set, rather than falling back", () => {
    // A silent fallback is how a deployment ends up querying the wrong
    // database; this has to fail at resolve time, not at the first query.
    expect(() => resolveDatabaseUrl({})).toThrow(/No database URL/);
  });

  it("throws on a DATABASE_URL that is not Postgres", () => {
    expect(() => resolveDatabaseUrl({ DATABASE_URL: "file:./dev.db" })).toThrow(
      /Postgres only/
    );
  });

  it("prefers an explicit DATABASE_URL", () => {
    expect(
      resolveDatabaseUrl({ DATABASE_URL: PG, POSTGRES_URL: "postgres://other/x" })
    ).toBe(PG);
  });

  it("uses Vercel Postgres vars when DATABASE_URL is absent", () => {
    // Vercel Postgres does not set DATABASE_URL. Reading only that would throw
    // in production even though a perfectly good database is attached.
    expect(resolveDatabaseUrl({ POSTGRES_PRISMA_URL: POOLED })).toBe(POOLED);
    expect(resolveDatabaseUrl({ POSTGRES_URL: PG })).toBe(PG);
    expect(resolveDatabaseUrl({ POSTGRES_URL_NON_POOLING: DIRECT })).toBe(DIRECT);
  });

  it("prefers the pooled URL over the plain one for the app", () => {
    expect(
      resolveDatabaseUrl({ POSTGRES_PRISMA_URL: POOLED, POSTGRES_URL: PG })
    ).toBe(POOLED);
  });

  it("uses the UNPOOLED url for schema pushes", () => {
    // pgbouncer does not support the session-level statements a migration issues.
    expect(
      resolveDirectDatabaseUrl({
        POSTGRES_PRISMA_URL: POOLED,
        POSTGRES_URL_NON_POOLING: DIRECT,
      })
    ).toBe(DIRECT);
  });

  it("falls back to the pooled url if no direct one exists", () => {
    expect(resolveDirectDatabaseUrl({ POSTGRES_PRISMA_URL: POOLED })).toBe(POOLED);
  });

  it("detects postgres URLs and rejects anything else", () => {
    expect(isPostgresUrl(PG)).toBe(true);
    expect(isPostgresUrl("postgresql://u:p@h/d")).toBe(true);
    expect(isPostgresUrl("file:./dev.db")).toBe(false);
    expect(isPostgresUrl("")).toBe(false);
  });
});

describe("precedence when both a local .env and a managed database exist", () => {
  it("lets a managed Postgres URL beat a stale non-Postgres DATABASE_URL", () => {
    // Next loads .env into the environment. If a leftover file: URL is still
    // sitting there, the attached database is plainly the one that was meant.
    expect(
      resolveDatabaseUrl({
        DATABASE_URL: "file:./dev.db",
        POSTGRES_PRISMA_URL: "postgres://u:p@pooler/db",
      })
    ).toBe("postgres://u:p@pooler/db");
  });

  it("still honours an explicit Postgres DATABASE_URL over the managed one", () => {
    expect(
      resolveDatabaseUrl({
        DATABASE_URL: "postgres://explicit/db",
        POSTGRES_URL: "postgres://managed/db",
      })
    ).toBe("postgres://explicit/db");
  });

  it("names the scheme it rejected, so the fix is obvious", () => {
    expect(() => resolveDatabaseUrl({ DATABASE_URL: "mysql://u:p@h/d" })).toThrow(
      /mysql:/
    );
  });
});
