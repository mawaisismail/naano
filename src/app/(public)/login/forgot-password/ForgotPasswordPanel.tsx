"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { LocaleButton } from "@/app/(public)/register/parts";
import {
  redeemRecoveryCode,
  requestRecoveryCode,
  type RecoveryState,
} from "@/lib/actions/password-recovery";

/**
 * Authored from naano's page at 1440:
 *   shell   min-h-screen bg-white grid-centre p-6, Plus Jakarta
 *   card    max-w-md, 1px #E9E9E7, radius 18, p-8, shadow-lg
 *   brand   32 mark + "naano" 24/700 -0.025em #37352F
 *   h1      24 / 600 #37352F centred, mb-2
 *   lead    14 #787774 centred, mb-8
 *   label   12 / 500 #475569, mb-1.5 ml-1
 *   input   bg-gray-50, 1px gray-200, radius 14, px-4 py-3, 14px
 *   submit  h-11, radius 14, 14 / 500, #0F172A -> #1E293B
 *
 * Their form posts the email and then asks for a 6-digit code; this does the
 * same, in two stages on one page, so the code never travels in a URL.
 */
export function ForgotPasswordPanel() {
  const [requested, requestAction, requesting] = useActionState<RecoveryState, FormData>(
    requestRecoveryCode,
    null
  );
  const [redeemed, redeemAction, redeeming] = useActionState<RecoveryState, FormData>(
    redeemRecoveryCode,
    null
  );
  const [email, setEmail] = useState("");

  const stage = redeemed?.stage ?? requested?.stage ?? "request";
  const error = redeemed?.error ?? requested?.error;
  const notice = requested?.notice;

  const input =
    "w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#111827] transition-all placeholder:text-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/10";
  const label = "mb-1.5 ml-1 block text-xs font-medium text-[#475569]";

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-white p-6"
      style={{ fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="w-full max-w-md rounded-[18px] border border-[#E9E9E7] bg-white p-8 shadow-lg">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="group flex cursor-pointer items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="naano" className="size-8 object-contain" />
            <span className="text-2xl font-bold tracking-tight text-[#37352F]">naano</span>
          </Link>
          <LocaleButton />
        </div>

        <h1 className="mb-2 text-center text-2xl font-semibold text-[#37352F]">
          Reset your password
        </h1>
        <p className="mb-8 text-center text-sm text-[#787774]">
          {stage === "request"
            ? "Enter your email and we'll send you a 6-digit code to set a new password."
            : "Enter the 6-digit code we sent, then choose a new password."}
        </p>

        {error ? (
          <p role="alert" className="mb-4 rounded-[14px] border border-[#F2D6C8] bg-[#FDF6F1] px-4 py-3 text-sm leading-5 text-[#8A4B22]">
            {error}
          </p>
        ) : null}
        {notice && stage === "verify" ? (
          <p className="mb-4 rounded-[14px] border border-[#CBDCF9] bg-[#F2F6FE] px-4 py-3 text-sm leading-5 text-[#1240D0]">
            {notice}
          </p>
        ) : null}

        {stage === "request" ? (
          <form action={requestAction} className="space-y-4">
            <div>
              <label htmlFor="forgot-password-email" className={label}>
                Email
              </label>
              <input
                id="forgot-password-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="john@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={input}
              />
            </div>
            <button
              type="submit"
              disabled={requesting}
              className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#0F172A] text-sm font-medium text-white transition-colors hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {requesting ? "Sending…" : "Send recovery code"}
            </button>
          </form>
        ) : (
          <form action={redeemAction} className="space-y-4">
            <input type="hidden" name="email" value={email} />
            <div>
              <label htmlFor="recovery-code" className={label}>
                6-digit code
              </label>
              <input
                id="recovery-code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                placeholder="000000"
                className={`${input} tracking-[0.4em]`}
              />
            </div>
            <div>
              <label htmlFor="recovery-password" className={label}>
                New password
              </label>
              <input
                id="recovery-password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={input}
              />
            </div>
            <button
              type="submit"
              disabled={redeeming}
              className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#0F172A] text-sm font-medium text-white transition-colors hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {redeeming ? "Setting your password…" : "Set new password"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="cursor-pointer text-sm font-medium text-[#1652F0] transition-colors">
            ← Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
