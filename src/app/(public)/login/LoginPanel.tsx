"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login } from "@/lib/actions/auth";
import { ErrorNote, LocaleButton } from "@/app/(public)/register/parts";

/**
 * /login — naano's sign-in screen, authored from their markup.
 *
 *   shell   min-h-screen flex, Inter; left flex-1 centred p-8 on white,
 *           inner max-w-md; right hidden until lg, p-12 on #2563eb
 *   h1      24 / 32 / 700 #111827 "Welcome back"
 *   lead    14 / 20 #6B7280, mt-1 mb-6
 *   form    space-y-5; the two provider buttons in a space-y-3 block, then a
 *           space-y-4 pt-1 block holding the rule, both fields and submit
 *   rule    1px #E9E9E7 either side of 11px/500 uppercase #9B9A97
 *   label   12 / 600 uppercase #5C5B57, mb-1.5 ml-1
 *   input   h 48ish: px-4 py-3.5, 14px, radius 14, 1px #D1D5DB,
 *           focus #2563eb with a 2px /15 ring
 *   submit  h-11, radius 14, 14 / 600 on #2563eb,
 *           shadow 0 4px 12px rgba(37,99,235,0.24)
 *
 * The password reveal is a real control on their page too, not decoration.
 */

const INPUT =
  "w-full rounded-[14px] border border-[#D1D5DB] bg-white px-4 py-3.5 text-sm text-[#111827] transition-all placeholder:text-[#9CA3AF] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15";
const LABEL = "mb-1.5 ml-1 block text-xs font-semibold uppercase tracking-wide text-[#5C5B57]";
const PROVIDER =
  "flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-[14px] border border-[#E5E7EB] bg-white text-[15px] font-semibold text-[#111827] transition-all hover:border-[#D1D5DB] hover:bg-[#F9FAFB]";

export function LoginPanel({
  next,
  error,
  provider,
}: {
  next?: string;
  error?: string;
  provider?: string;
}) {
  const [state, action, pending] = useActionState(login, null as { error?: string } | null);
  const [show, setShow] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div className="flex flex-1 items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="naano" className="h-7 w-auto object-contain" />
            <LocaleButton />
          </div>

          <h1 className="text-2xl font-bold text-[#111827]">Welcome back</h1>
          <p className="mb-6 mt-1 text-sm text-[#6B7280]">Sign in to your account</p>

          <form action={action} noValidate className="space-y-5">
            {next ? <input type="hidden" name="next" value={next} /> : null}

            <div className="space-y-3">
              <a
                href="/api/auth/oauth/start?provider=linkedin_oidc"
                className={PROVIDER}
                style={{ boxShadow: "0 2px 6px rgba(15,23,42,0.05)" }}
              >
                <span className="grid size-[18px] place-items-center rounded-[3px] bg-[#0A66C2]" aria-hidden>
                  <svg viewBox="0 0 24 24" className="size-3 text-white" fill="currentColor">
                    <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0ZM.24 8.25h4.5V24h-4.5V8.25Zm7.5 0h4.31v2.15h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9V24h-4.5v-7.9c0-1.88-.03-4.3-2.62-4.3-2.62 0-3.02 2.05-3.02 4.16V24h-4.5V8.25Z" />
                  </svg>
                </span>
                <span>Continue with LinkedIn</span>
              </a>
              <a
                href="/api/auth/oauth/start?provider=google"
                className={PROVIDER}
                style={{ boxShadow: "0 2px 6px rgba(15,23,42,0.05)" }}
              >
                <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
                  <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.87c2.26-2.09 3.56-5.17 3.56-8.87Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.87-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z" />
                  <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l3.99-3.09Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
                </svg>
                <span>Continue with Google</span>
              </a>
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-[#E9E9E7]" />
                <span className="text-[11px] font-medium uppercase tracking-wide text-[#9B9A97]">
                  Or continue with email
                </span>
                <span className="h-px flex-1 bg-[#E9E9E7]" />
              </div>

              <ErrorNote error={error} provider={provider} />
              {state?.error ? (
                <p role="alert" className="rounded-[14px] border border-[#F2D6C8] bg-[#FDF6F1] px-4 py-3 text-sm leading-5 text-[#8A4B22]">
                  {state.error}
                </p>
              ) : null}

              <div>
                <label htmlFor="login-email" className={LABEL}>
                  Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="john@company.com"
                  className={INPUT}
                />
              </div>

              <div>
                <div className="mb-1.5 ml-1 flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wide text-[#5C5B57]">
                    Password
                  </label>
                  <Link
                    href="/login/forgot-password"
                    className="cursor-pointer text-xs font-medium text-[#2563eb] transition-colors hover:text-[#1d4ed8]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={show ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`${INPUT} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1 text-[#9B9A97] transition-colors hover:bg-[#F7F6F3] hover:text-[#37352F]"
                  >
                    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      {show ? (
                        <>
                          <path d="M10.7 5.1A10.4 10.4 0 0 1 12 5c7 0 10 7 10 7a13.2 13.2 0 0 1-2.2 3.2M6.6 6.6A13.3 13.3 0 0 0 2 12s3 7 10 7a10.2 10.2 0 0 0 5.4-1.6" />
                          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20" />
                        </>
                      ) : (
                        <>
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#2563eb] text-sm font-semibold text-white transition-all hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-40"
                style={{ boxShadow: "0 4px 12px rgba(37,99,235,0.24)" }}
              >
                {pending ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-[#6B7280]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-[#2563eb]">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center p-12 text-white lg:flex" style={{ background: "#2563eb" }}>
        <div className="max-w-sm">
          <h2 className="mb-4 text-3xl font-bold">Welcome back.</h2>
          <p className="text-[#DBEAFE]">
            Sign in to manage your campaigns, creators and payouts, all in one place.
          </p>
        </div>
      </div>
    </div>
  );
}
