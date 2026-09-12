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

/** connectionString + ssl, agreeing with each other. */
export function pgConnection(
  url: string,
  env: Record<string, string | undefined> = process.env
): { connectionString: string; ssl?: ConnectionOptions } {
  const ssl = databaseSsl(env);
  return ssl ? { connectionString: withoutSslMode(url), ssl } : { connectionString: url };
}
