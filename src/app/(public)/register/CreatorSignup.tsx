"use client";

import { useActionState, useState } from "react";
import { register } from "@/lib/actions/auth";
import { MarketplaceCard } from "./MarketplaceCard";
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
 * /register?role=influencer — the creator side.
 *
 * Both columns live in one client component because the card on the right
 * fills in from the form on the left as it is typed, which is the whole point
 * of that panel on naano's page.
 *
 * Measured at 1440: the page is a 100dvh flex with its own scroll on the left
 * column, left padding px-8 (xl:px-10) with pt clamp(1.75rem,7dvh,4.5rem), and
 * an inner max-w-md. Copy and control metrics are naano's.
 */

const HEARD = ["LinkedIn", "Another creator", "Word of mouth", "Google search", "Other"] as const;

export function CreatorSignup({ error, provider }: { error?: string; provider?: string }) {
  const [mode, setMode] = useState<"options" | "email">("options");
  const f = useSignupFields();
  const [state, action, pending] = useActionState(register, null);

  const displayName = [f.firstName, f.lastName].filter(Boolean).join(" ");

  return (
    <div
      className="flex h-[100dvh] max-h-full min-h-0 overflow-hidden"
      style={{ fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ------------------------------------------------------------ left */}
      <div className="flex h-full min-h-0 flex-1 items-start justify-center overflow-y-auto overscroll-y-contain bg-white px-8 pb-10 pt-[clamp(1.75rem,7dvh,4.5rem)] sm:pb-12 xl:px-10">
        <div className="w-full max-w-md pb-4">
          <Header />

          {mode === "options" ? (
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#2563eb]">
                Step 1 of 4
              </div>
              <h1 className="text-2xl font-bold text-[#111827]">Join Naano</h1>
              <p className="text-sm text-[#6B7280]">
                Get paid to create LinkedIn content for B2B brands you actually use.
              </p>
              <ErrorNote error={error} provider={provider} />
              <ProviderButtons role="influencer" onEmail={() => setMode("email")} />
              <SignInLine size="creator" />
            </div>
          ) : (
            <form action={action} className="space-y-4">
              <input type="hidden" name="role" value="influencer" />
              <BackToOptions onClick={() => setMode("options")} />
              <div className="text-xs font-semibold uppercase tracking-wide text-[#2563eb]">
                Step 1 of 4
              </div>
              <h1 className="text-2xl font-bold text-[#111827]">Join Naano</h1>
              <p className="text-sm text-[#6B7280]">
                Get paid to create LinkedIn content for B2B brands you actually use.
              </p>

              {state?.error ? (
                <p role="alert" className="rounded-[10px] border border-[#F2D6C8] bg-[#FDF6F1] px-3.5 py-2.5 text-sm leading-5 text-[#8A4B22]">
                  {state.error}
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <Field size="creator" name="firstName" label="First name" placeholder="First name" autoComplete="given-name" value={f.firstName} onChange={f.setFirstName} />
                <Field size="creator" name="lastName" label="Last name" placeholder="Last name" autoComplete="family-name" value={f.lastName} onChange={f.setLastName} />
              </div>
              <Field size="creator" name="email" label="Email" placeholder="you@email.com" type="email" autoComplete="email" value={f.email} onChange={f.setEmail} />
              <Field size="creator" name="password" label="Password" placeholder="Create a strong password" type="password" autoComplete="new-password" minLength={8} value={f.password} onChange={f.setPassword} />
              <HeardAbout size="creator" options={HEARD} value={f.heard} onChange={f.setHeard} />

              <button
                disabled={pending}
                className="w-full cursor-pointer rounded-[10px] bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Creating your account…" : "Continue"}
              </button>
              <SignInLine size="creator" />
            </form>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------- right */}
      <div className="hidden h-full min-h-0 flex-1 items-start justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,#FFFFFF_0%,#F1F6FF_46%,#EEF0FF_100%)] px-8 pb-10 pt-[clamp(1.75rem,7dvh,4.5rem)] lg:flex xl:px-12">
        <div className="flex w-full max-w-[560px] flex-col items-center">
          <div className="mb-4 max-w-[500px] text-center xl:mb-5">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#2563EB]">
              Your Marketplace card
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[#111827] xl:text-3xl">
              Build a card brands can trust.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#596273]">
              It updates live with your profile, analytics, positioning and price.
            </p>
          </div>
          <MarketplaceCard name={displayName} />
        </div>
      </div>
    </div>
  );
}
