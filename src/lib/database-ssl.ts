import type { ConnectionOptions } from "node:tls";

/**
 * TLS settings for the Postgres connection.
 *
 * `sslmode=require` in a URL means "encrypt", not "verify". On its own it will
 * happily accept any certificate the other end presents, which stops a passive
 * eavesdropper and does nothing at all about an active one — encryption
 * without authentication. Aiven publishes a project CA for exactly this
 * reason, so when DATABASE_CA_CERT is present the certificate chain is
 * actually checked.
 *
 * Returns undefined when no CA is configured, which leaves the URL's own
 * sslmode in charge — the right behaviour for a local Postgres with no TLS.
 */
export function databaseSsl(
  env: Record<string, string | undefined> = process.env
): ConnectionOptions | undefined {
  const ca = env.DATABASE_CA_CERT?.trim();
  if (!ca) return undefined;

  return {
    // A PEM pasted into a .env file arrives with literal \n in some shells and
    // real newlines in others; both have to work.
    ca: ca.includes("\\n") ? ca.replace(/\\n/g, "\n") : ca,
    rejectUnauthorized: true,
  };
}

/**
 * The same URL with `sslmode` removed.
 *
 * node-postgres builds its own TLS options from `sslmode` in the connection
 * string, and those win over an explicit `ssl` object — so a URL carrying
 * `sslmode=require` silently discards the CA and the connection fails with
 * "self-signed certificate in certificate chain" against a perfectly valid
 * managed database. Dropping the parameter when a CA is configured leaves one
 * source of truth for TLS instead of two that disagree.
 */
export function withoutSslMode(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("sslmode");
    u.searchParams.delete("ssl");
    return u.toString();
  } catch {
    // Not a parseable URL: leave it alone and let the driver complain.
    return url;
  }
}

/**
 * How many connections one process may hold.
 *
 * This matters more than it looks. The managed plan allows 20 connections in
 * total, and a serverless deployment does not run one process — it runs one
 * per concurrent request, each opening its own pool. At the pg default of 10,
 * two warm instances exhaust the whole plan and the third request fails with
 * "too many clients", which looks like a database outage and is really a
 * configuration mistake.
 *
 * Small per instance is therefore correct on serverless, where breadth comes
 * from having many instances; a single long-lived server wants the opposite.
 */
function poolMax(env: Record<string, string | undefined>): number {
  const explicit = Number(env.DATABASE_POOL_MAX);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  // VERCEL is set on their build and runtime; AWS_LAMBDA_FUNCTION_NAME covers
  // the general case of a function-per-request platform.
  const serverless = Boolean(env.VERCEL || env.AWS_LAMBDA_FUNCTION_NAME);
  return serverless ? 3 : 10;
}

/** connectionString + ssl + pool size, all agreeing with each other. */
export function pgConnection(
  url: string,
  env: Record<string, string | undefined> = process.env
): { connectionString: string; ssl?: ConnectionOptions; max: number } {
  const ssl = databaseSsl(env);
  return {
    connectionString: ssl ? withoutSslMode(url) : url,
    ...(ssl ? { ssl } : {}),
    max: poolMax(env),
  };
}
