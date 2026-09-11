import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Session signing secret.
 *
 * A hardcoded fallback that survives into production is a full authentication
 * bypass: the secret is in a public repo, so anyone can mint `signSession(id)`
 * for any user id and read that account. The fallback therefore exists ONLY in
 * development, and production refuses to boot without a real secret rather than
 * silently accepting forgeable cookies.
 */
function resolveSecret(): string {
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 32) return fromEnv;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET is missing or shorter than 32 characters. Refusing to " +
        "start: without it, session cookies are forgeable by anyone who has " +
        "read this repository. Generate one with `openssl rand -base64 32`."
    );
  }

  return "naano-rebuild-development-only-secret-do-not-deploy";
}

const SECRET = resolveSecret();

/**
 * Session cookies are signed. Storing a bare user id would let anyone read
 * another account's dashboard by editing one cookie value in devtools.
 */
export function signSession(userId: string): string {
  const mac = createHmac("sha256", SECRET).update(userId).digest("base64url");
  return `${userId}.${mac}`;
}

export function readSession(cookie: string | undefined): string | null {
  if (!cookie) return null;
  const i = cookie.lastIndexOf(".");
  if (i < 1) return null;

  const userId = cookie.slice(0, i);
  const given = Buffer.from(cookie.slice(i + 1));
  const expected = Buffer.from(
    createHmac("sha256", SECRET).update(userId).digest("base64url")
  );

  if (given.length !== expected.length) return null;
  return timingSafeEqual(given, expected) ? userId : null;
}

/**
 * Only allow post-login redirects to our own paths. A `next` value comes from
 * the query string, so accepting `//evil.com` or `https://evil.com` would turn
 * the login page into an open redirect — a credible phishing primitive, because
 * the link genuinely starts on our domain.
 */
export function safeNextPath(next: string | undefined | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//") || next.startsWith("/\\")) return null;
  if (/[\r\n]/.test(next)) return null;
  return next;
}
