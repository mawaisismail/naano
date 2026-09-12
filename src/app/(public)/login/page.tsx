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
  return <LoginPanel next={next} error={error} provider={provider} />;
}
