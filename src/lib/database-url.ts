/**
 * Resolve the database URL from whatever the host actually provides.
 *
 * Vercel Postgres does NOT set DATABASE_URL. It injects POSTGRES_PRISMA_URL
 * (pooled, pgbouncer — the right one for serverless), POSTGRES_URL, and
 * POSTGRES_URL_NON_POOLING (direct, for migrations). Reading only DATABASE_URL
 * would silently fall through to SQLite in production, which fails at connect
 * time rather than at build time and is miserable to debug.
 *
 * Order matters: an explicit DATABASE_URL wins, then the pooled Vercel URL,
 * then the plain one.
 */
type Env = Record<string, string | undefined>;

export function resolveDatabaseUrl(env: Env = process.env): string {
  const explicit = env.DATABASE_URL?.trim();
  const vercel =
    env.POSTGRES_PRISMA_URL?.trim() ||
    env.POSTGRES_URL?.trim() ||
    env.POSTGRES_URL_NON_POOLING?.trim();

  // An explicit Postgres DATABASE_URL always wins.
  if (explicit && isPostgresUrl(explicit)) return explicit;

  // A managed Postgres URL beats a *SQLite* DATABASE_URL. Next loads .env into
  // the environment, and .env carries the local file: URL — so without this, a
  // developer's local file would quietly override the real database and the
  // build would pick the wrong driver. If a Postgres database is attached, it
  // is the one that was meant.
  if (vercel) return vercel;

  return explicit || "file:./dev.db";
}

/**
 * The direct, unpooled URL. Schema pushes and migrations must not go through
 * pgbouncer — it does not support the session-level statements they issue.
 */
export function resolveDirectDatabaseUrl(env: Env = process.env): string {
  return (
    env.POSTGRES_URL_NON_POOLING ||
    env.DIRECT_DATABASE_URL ||
    resolveDatabaseUrl(env)
  );
}

export const isPostgresUrl = (url: string) => /^postgres(ql)?:\/\//i.test(url);
