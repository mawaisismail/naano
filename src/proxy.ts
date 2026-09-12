import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { isProtectedPath } from "@/lib/routes";

/**
 * Proxy — Next.js 16's replacement for Middleware. Same execution model, new
 * name and new file convention: one `proxy.ts` beside `app/`, exporting either
 * a default function or a named `proxy`.
 *
 * What this does, and deliberately does not do:
 *
 * The Next docs are explicit that Proxy is for *optimistic* checks, not for
 * session management or authorization — it runs before the request completes,
 * on every matched navigation, and a database round-trip here would tax every
 * one of them. So this only asks "is there a session cookie at all?", which is
 * enough to bounce signed-out traffic without rendering a protected layout.
 *
 * The real check is in src/app/(authenticated)/layout.tsx, which verifies the
 * cookie signature and loads the user. A forged or expired cookie sails past
 * the proxy and is stopped there. Authorization is never the proxy's job.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);


  // Signed out, asking for a protected page: send them to sign in, and carry
  // the destination so they land where they were going.
  if (!hasSession && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // There is deliberately no rule sending a signed-in user away from /login.
  // The cookie's existence is not proof it resolves to a user, and acting on
  // it alone loops forever once a cookie outlives its account. See
  // src/lib/routes.ts.

  return NextResponse.next();
}

export const config = {
  // Without a matcher the proxy runs on every request, static assets included.
  // These are the only paths whose response it can change.
  matcher: ["/app/:path*", "/studio/:path*", "/creator/:path*"],
};
