import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { homeForRole } from "@/lib/routes";
import { LoginPanel } from "./LoginPanel";

/**
 * /login — naano links here as /login?reauth=1 from every "Sign in" in the
 * marketing chrome. Their page renders identically with and without the
 * parameter, so it is accepted and ignored rather than branched on.
 */
export const metadata = { title: "Sign in — Naano" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; provider?: string }>;
}) {
  const { next, error, provider } = await searchParams;

  // The proxy no longer bounces cookie-holders away from here, because a
  // cookie is not proof of a session. This check is the real one: it resolves
  // the user, so a dead cookie simply renders the sign-in form.
  const user = await getCurrentUser();
  if (user) redirect(homeForRole(user.role));

  return <LoginPanel next={next} error={error} provider={provider} />;
}
