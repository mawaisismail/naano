/**
 * Resolve the Postgres URL from whatever the host actually provides.
 *
 * Vercel Postgres does NOT set DATABASE_URL. It injects POSTGRES_PRISMA_URL
 * (pooled, pgbouncer — the right one for serverless), POSTGRES_URL, and
 * POSTGRES_URL_NON_POOLING (direct, for migrations). Reading only DATABASE_URL
 * would throw in production even though a perfectly good database is attached.
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

  // Anything else in DATABASE_URL is a mistake worth naming rather than
  // working around.
  if (explicit && !vercel) {
    throw new Error(
      `DATABASE_URL is not a Postgres connection string: ${explicit.split(":")[0]}: — ` +
        "this project runs on Postgres only."
    );
  }

  // A managed Postgres URL beats anything else DATABASE_URL happens to hold:
  // if a database is attached to the deployment, it is the one that was meant.
  if (vercel) return vercel;

  // No silent fallback. A missing URL has to fail here, loudly, rather than at
  // the first query in a request handler.
  throw new Error(
    "No database URL. Set DATABASE_URL to a Postgres connection string " +
      "(postgres://…), or deploy with POSTGRES_PRISMA_URL set by the host."
  );
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
