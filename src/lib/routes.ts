/**
 * The single source of truth for which URLs require a session.
 *
 * Both halves of the app read this list: the proxy uses it for the optimistic
 * cookie check at the edge, and the (authenticated) layout uses the same
 * prefixes when it decides where to send someone back to after signing in.
 * Keeping one list means a new protected section cannot be added to the router
 * and forgotten at the gate.
 */

/** Everything under these prefixes is behind a session. */
export const PROTECTED_PREFIXES = ["/app", "/studio", "/creator"] as const;

/**
 * Signed-in users have no business here, so the proxy sends them onward.
 *
 * /register is deliberately NOT in this list. naano runs the whole creator
 * wizard on /register?role=influencer, so a signed-in creator mid-onboarding
 * has every reason to be there — bouncing them produced a redirect loop
 * between /register, /creator and back. The register page decides for itself:
 * it renders the wizard while onboarding is unfinished and redirects to the
 * right workspace once it is done.
 */
export const AUTH_ENTRY_PATHS = ["/login"] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function isAuthEntryPath(pathname: string): boolean {
  return AUTH_ENTRY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Where a role lands after signing in. */
export function homeForRole(role: string): string {
  return role === "creator" ? "/studio" : "/app";
}
