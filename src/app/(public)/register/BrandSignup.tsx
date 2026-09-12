"use client";

import { useActionState, useState } from "react";
import { register } from "@/lib/actions/auth";
import {
  BackToOptions,
  ErrorNote,
  Field,
  Header,
  HeardAbout,
  ProviderButtons,
  SignInLine,
  useSignupFields,
} from "./parts";

/**
 * /register?role=saas — the brand side.
 *
 * A different component from the creator flow on naano's site too, not a
 * variant of it: Inter rather than Plus Jakarta, larger controls, a heavier
 * headline, "Business email" instead of "Email", its own attribution chips,
 * and a plain blue panel on the right rather than the live card.
 *
 * Measured at 1440: left column p-6 (sm:p-10) centred, inner max-w-md;
 * h1 1.75rem extrabold -0.025em #0f172a; the blue promise line at 0.95rem
 * bold #2563eb; body #64748b.
 */

const HEARD = ["LinkedIn", "Word of mouth", "Google search", "A creator", "Other"] as const;

export function BrandSignup({ error, provider }: { error?: string; provider?: string }) {
  const [mode, setMode] = useState<"options" | "email">("options");
  const f = useSignupFields();
  const [state, action, pending] = useActionState(register, null);

  const intro = (
    <>
      <h1 className="text-[1.75rem] font-extrabold tracking-tight text-[#0f172a]">Join Naano</h1>
      <p className="text-[0.95rem] font-bold text-[#2563eb]">Creators. Brands. Results.</p>
      <p className="text-sm text-[#64748b]">
        The #1 platform to run LinkedIn creator campaigns that drive real business.
      </p>
    </>
  );

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div className="flex min-w-0 flex-1 items-start justify-center overflow-y-auto bg-white p-6 sm:items-center sm:p-10">
        <div className="w-full max-w-md">
          <Header />

          {mode === "options" ? (
            <div className="space-y-4">
              {intro}
              <ErrorNote error={error} provider={provider} />
              <ProviderButtons role="saas" onEmail={() => setMode("email")} />
              <SignInLine size="brand" />
            </div>
          ) : (
            <form action={action} className="space-y-4">
              <input type="hidden" name="role" value="saas" />
              <BackToOptions onClick={() => setMode("options")} />
              {intro}

              {state?.error ? (
                <p role="alert" className="rounded-[10px] border border-[#F2D6C8] bg-[#FDF6F1] px-3.5 py-2.5 text-sm leading-5 text-[#8A4B22]">
                  {state.error}
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <Field size="brand" name="firstName" label="First name" placeholder="First name" autoComplete="given-name" value={f.firstName} onChange={f.setFirstName} />
                <Field size="brand" name="lastName" label="Last name" placeholder="Last name" autoComplete="family-name" value={f.lastName} onChange={f.setLastName} />
              </div>
              <Field size="brand" name="email" label="Business email" placeholder="you@company.com" type="email" autoComplete="email" value={f.email} onChange={f.setEmail} />
              <Field size="brand" name="password" label="Password" placeholder="Create a strong password" type="password" autoComplete="new-password" minLength={8} value={f.password} onChange={f.setPassword} />
              <HeardAbout size="brand" options={HEARD} value={f.heard} onChange={f.setHeard} />

              <button
                disabled={pending}
                className="w-full rounded-[10px] bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4fd7] disabled:opacity-50"
              >
                {pending ? "Creating your account…" : "Continue"}
              </button>
              <SignInLine size="brand" />
            </form>
          )}
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center p-12 text-white lg:flex" style={{ background: "#2563eb" }}>
        <div className="max-w-sm">
          <h2 className="mb-4 text-3xl font-bold">Creators. Brands. Results.</h2>
          <p className="mb-8 text-[#DBEAFE]">
            Run LinkedIn creator campaigns that drive real business - discover creators,
            track performance, pay in one click.
          </p>
          <div className="text-sm text-[#BFDBFE]">Built for B2B marketing teams</div>
        </div>
      </div>
    </div>
  );
}
