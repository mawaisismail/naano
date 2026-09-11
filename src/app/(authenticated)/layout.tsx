import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

/**
 * The authentication boundary for the whole signed-in surface.
 *
 * Everything under (authenticated) is behind this layout, so a new section
 * added to the group inherits the gate instead of having to remember it. The
 * route group is a folder convention only — it does not appear in any URL, so
 * /app and /studio are unchanged.
 *
 * This is the real check, not the proxy's. The proxy asks only whether a
 * session cookie exists; here the cookie's signature is verified and the user
 * loaded, so a forged, expired or deleted-user cookie is stopped at this line.
 */
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // No `next` param: the proxy already redirected genuinely signed-out traffic
  // with the destination attached. Reaching here means the cookie was present
  // but did not resolve to a user, and the path is not worth preserving.
  if (!user) redirect("/login");

  return <>{children}</>;
}
