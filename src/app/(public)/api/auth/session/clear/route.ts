import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { safeNextPath } from "@/lib/auth";

/**
 * GET /api/auth/session/clear?next=/login
 *
 * Drops a session cookie that no longer resolves to a user and sends the
 * browser on. A Server Component cannot set cookies while rendering, so a
 * layout that discovers a dead session has nowhere to put the deletion — it
 * can only redirect here.
 *
 * Without this, a cookie for a deleted user leaves the browser permanently
 * half-signed-in: every protected navigation pays a redirect, and nothing ever
 * clears the cookie that caused it.
 */
export function GET(request: NextRequest) {
  const next = safeNextPath(request.nextUrl.searchParams.get("next")) ?? "/login";
  const res = NextResponse.redirect(new URL(next, request.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
