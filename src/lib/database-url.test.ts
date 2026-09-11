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
  it("falls back to local SQLite when nothing is set", () => {
    expect(resolveDatabaseUrl({})).toBe("file:./dev.db");
  });

  it("prefers an explicit DATABASE_URL", () => {
    expect(
      resolveDatabaseUrl({ DATABASE_URL: PG, POSTGRES_URL: "postgres://other/x" })
    ).toBe(PG);
  });

  it("uses Vercel Postgres vars when DATABASE_URL is absent", () => {
    // Vercel Postgres does not set DATABASE_URL. Reading only that would fall
    // through to SQLite in production and fail at connect time.
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

  it("detects postgres URLs and not sqlite ones", () => {
    expect(isPostgresUrl(PG)).toBe(true);
    expect(isPostgresUrl("postgresql://u:p@h/d")).toBe(true);
    expect(isPostgresUrl("file:./dev.db")).toBe(false);
    expect(isPostgresUrl("")).toBe(false);
  });
});

describe("precedence when both a local .env and a managed database exist", () => {
  it("lets a managed Postgres URL beat a local SQLite DATABASE_URL", () => {
    // Next loads .env into the environment, and .env carries file:./dev.db.
    // Without this rule the build picks the sqlite driver against a Postgres
    // schema and dies with a driver/provider mismatch.
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

  it("keeps plain local development on SQLite", () => {
    expect(resolveDatabaseUrl({ DATABASE_URL: "file:./dev.db" })).toBe(
      "file:./dev.db"
    );
  });
});
