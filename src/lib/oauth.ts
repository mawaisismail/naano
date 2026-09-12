import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * OAuth 2.0 / OpenID Connect sign-in for Google and LinkedIn.
 *
 * This is the authorization-code flow with PKCE, which is what both providers
 * document for server-side apps in 2026. The parts that matter for safety:
 *
 *   state          random, stored in an httpOnly cookie and compared in
 *                  constant time on the way back. Without it, an attacker can
 *                  complete a login in a victim's browser (CSRF on the
 *                  callback) and have the victim act as the attacker's account.
 *   PKCE verifier  random, cookie-stored, sent only on the token exchange. It
 *                  makes a stolen authorization code useless on its own.
 *   nonce          echoed inside the ID token, so a token minted for a
 *                  different session cannot be replayed into this one.
 *
 * Nothing here trusts the browser: the profile comes from the token endpoint
 * and the userinfo endpoint over TLS, never from a redirect parameter.
 */

export type ProviderId = "google" | "linkedin_oidc";

export type OAuthProfile = {
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

type ProviderConfig = {
  id: ProviderId;
  label: string;
  authorizeUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  scope: string;
  clientId?: string;
  clientSecret?: string;
};

export function providerConfig(id: ProviderId): ProviderConfig {
  if (id === "google") {
    return {
      id,
      label: "Google",
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userinfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
      scope: "openid email profile",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }
  return {
    id,
    label: "LinkedIn",
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    userinfoUrl: "https://api.linkedin.com/v2/userinfo",
    // LinkedIn's modern OIDC product. The old r_liteprofile / r_emailaddress
    // scopes belong to a product that is no longer granted to new apps.
    scope: "openid profile email",
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  };
}

export function isProviderId(v: string | null | undefined): v is ProviderId {
  return v === "google" || v === "linkedin_oidc";
}

/**
 * Whether a provider is actually usable. The placeholder values shipped in
 * .env.example are treated as absent, so a developer who has not set real
 * credentials gets an honest "not configured" screen instead of a redirect to
 * a provider that will reject the request with an opaque error.
 */
export function isConfigured(id: ProviderId): boolean {
  const { clientId, clientSecret } = providerConfig(id);
  const real = (v?: string) =>
    Boolean(v && v.trim() && !/^(dummy|changeme|your[-_])/i.test(v.trim()));
  return real(clientId) && real(clientSecret);
}

export function callbackUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/auth/oauth/callback`;
}

/* ------------------------------------------------------------------ PKCE -- */

export function randomUrlToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function codeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

/** Constant-time compare, so a mismatched state cannot be probed byte by byte. */
export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}

export function authorizeUrl(opts: {
  provider: ProviderId;
  redirectUri: string;
  state: string;
  nonce: string;
  verifier: string;
}): string {
  const cfg = providerConfig(opts.provider);
  const url = new URL(cfg.authorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", cfg.clientId ?? "");
  url.searchParams.set("redirect_uri", opts.redirectUri);
  url.searchParams.set("scope", cfg.scope);
  url.searchParams.set("state", opts.state);
  url.searchParams.set("nonce", opts.nonce);
  url.searchParams.set("code_challenge", codeChallenge(opts.verifier));
  url.searchParams.set("code_challenge_method", "S256");
  if (opts.provider === "google") {
    // Without these Google silently reuses a previous grant and returns no
    // refresh token, and a user with two accounts can never pick the other one.
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "select_account");
  }
  return url.toString();
}

/* ------------------------------------------------------- token + profile -- */

export async function exchangeCode(opts: {
  provider: ProviderId;
  code: string;
  redirectUri: string;
  verifier: string;
}): Promise<{ accessToken: string; idToken?: string }> {
  const cfg = providerConfig(opts.provider);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
    client_id: cfg.clientId ?? "",
    client_secret: cfg.clientSecret ?? "",
    code_verifier: opts.verifier,
  });

  const res = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    // The provider's body can contain the client_secret echoed back in an
    // error payload, so it is not forwarded to the user or the logs.
    throw new Error(`${cfg.label} rejected the authorization code (${res.status})`);
  }
  const json = (await res.json()) as { access_token?: string; id_token?: string };
  if (!json.access_token) throw new Error(`${cfg.label} returned no access token`);
  return { accessToken: json.access_token, idToken: json.id_token };
}

export async function fetchProfile(
  provider: ProviderId,
  accessToken: string
): Promise<OAuthProfile> {
  const cfg = providerConfig(provider);
  const res = await fetch(cfg.userinfoUrl, {
    headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${cfg.label} userinfo failed (${res.status})`);

  // Both providers speak OIDC here, so the claim names are the same shape.
  const c = (await res.json()) as Record<string, unknown>;
  const str = (k: string) => (typeof c[k] === "string" ? (c[k] as string) : "");

  const sub = str("sub");
  const email = str("email").toLowerCase();
  if (!sub) throw new Error(`${cfg.label} returned no subject claim`);
  if (!email) throw new Error(`${cfg.label} did not share an email address`);

  const given = str("given_name");
  const family = str("family_name");
  const full = str("name");
  const [fallbackFirst = "", ...fallbackRest] = full.split(" ");

  return {
    providerAccountId: sub,
    email,
    emailVerified: c.email_verified === true || c.email_verified === "true",
    firstName: given || fallbackFirst,
    lastName: family || fallbackRest.join(" "),
    avatarUrl: str("picture") || null,
  };
}

/** Cookie names for the short-lived handshake values. */
export const OAUTH_COOKIES = {
  state: "naano_oauth_state",
  verifier: "naano_oauth_verifier",
  nonce: "naano_oauth_nonce",
  role: "naano_oauth_role",
} as const;

/** Ten minutes is longer than any real consent screen and short enough to matter. */
export const OAUTH_COOKIE_MAX_AGE = 600;
