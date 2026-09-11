import Link from "next/link";
import { AuthPanel } from "@/components/AuthPanel";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in — Naano" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthPanel
        title="Welcome back."
        body="Sign in to manage your campaigns, creators and payouts, all in one place."
      />
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-extrabold text-ink">Sign in</h1>
          <p className="mt-1.5 text-sm text-muted">
            New here?{" "}
            <Link href="/register" className="font-semibold text-brand hover:underline">
              Create an account
            </Link>
          </p>

          {/* Reviewers must be able to see both sides without signing up. */}
          <div className="mt-6 rounded-xl border border-brand/20 bg-brand-soft/50 p-4">
            <div className="nn-eyebrow text-brand">Demo accounts</div>
            <ul className="mt-2 space-y-1 font-mono text-[12px] text-ink">
              <li>brand@naano.demo &nbsp;·&nbsp; demo1234</li>
              <li>creator@naano.demo &nbsp;·&nbsp; demo1234</li>
            </ul>
            <p className="mt-2 text-[11px] text-muted">
              Click a button below to fill them in.
            </p>
          </div>

          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
