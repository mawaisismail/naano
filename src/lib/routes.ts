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
 * There is deliberately no "signed-in users get bounced off /login" rule.
 *
 * The proxy can only see that a session cookie EXISTS; it cannot check that it
 * resolves to a user without a database round trip, which is exactly what a
 * proxy must not do. Bouncing on the cookie alone produced an infinite loop
 * the moment a cookie outlived its user — a deleted account, a reseeded
 * database, a rotated secret:
 *
 *   /app     cookie present, proxy lets it through
 *   layout   no user, redirects to /login
 *   /login   cookie present, proxy sends it back to /app
 *
 * Both pages decide for themselves instead: /login redirects a genuinely
 * signed-in user to their workspace, and the authenticated layout clears a
 * dead cookie on the way out.
 */

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/** Where a role lands after signing in. */
export function homeForRole(role: string): string {
  return role === "creator" ? "/studio" : "/app";
}
