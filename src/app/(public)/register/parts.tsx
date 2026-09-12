"use client";

import {
  ProviderButtons as SharedProviderButtons,
  type ProviderAvailability,
} from "@/components/auth/ProviderButtons";

import { useState } from "react";

/**
 * Pieces shared by both sign-up flows, authored from naano's own markup.
 *
 * Their two flows are not the same component: the creator side sets body copy
 * in Plus Jakarta and uses smaller controls (rounded-lg, px-3 py-2, text-sm),
 * the brand side uses Inter and larger ones (rounded-[10px], px-3.5 py-2.5,
 * text-[15px]). The size is passed in rather than guessed so each flow keeps
 * the metrics it actually has.
 */

export type Size = "creator" | "brand";

const INPUT: Record<Size, string> = {
  creator:
    "w-full border border-[#D1D5DB] rounded-[10px] px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563eb]",
  brand:
    "w-full border border-[#D1D5DB] rounded-[10px] px-3.5 py-2.5 text-[15px] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]",
};

const LABEL: Record<Size, string> = {
  creator: "text-xs font-semibold text-[#5C5B57] uppercase tracking-wide",
  brand: "text-xs font-bold text-[#5C5B57] uppercase tracking-wide",
};

const FIELD_GAP: Record<Size, string> = { creator: "mt-1", brand: "mt-1.5" };

/* ------------------------------------------------------------- chrome --- */

/** naano's locale switch. It is display only on their page too — one locale. */
export function LocaleButton() {
  return (
    <button
      type="button"
      aria-label="Switch language"
      className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 transition-colors hover:bg-[#F7F7F5]"
    >
      <svg viewBox="0 0 24 24" className="size-[14px] text-[#6B6D74]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20" />
      </svg>
      <span className="text-[13px] font-semibold uppercase leading-[18px] tracking-[0.02em] text-[#17181C]">
        EN
      </span>
    </button>
  );
}

export function Header() {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="naano" className="h-7 w-auto object-contain" />
      <LocaleButton />
    </div>
  );
}

/* -------------------------------------------------------------- fields --- */

export function Field({
  size,
  name,
  label,
  placeholder,
  type = "text",
  autoComplete,
  minLength,
  value,
  onChange,
}: {
  size: Size;
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  minLength?: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className={LABEL[size]}>{label}</span>
      <div className={FIELD_GAP[size]}>
        <input
          required
          name={name}
          type={type}
          autoComplete={autoComplete}
          minLength={minLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT[size]}
        />
      </div>
    </label>
  );
}

/**
 * "How did you hear about us?" — buttons, not a select, exactly as naano has
 * it. aria-pressed carries the state; the chosen value rides along in a hidden
 * input so the form still works before hydration finishes.
 */
export function HeardAbout({
  size,
  options,
  value,
  onChange,
}: {
  size: Size;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const id = `${size}-heard-label`;
  return (
    <div>
      <span id={id} className={LABEL[size]}>
        How did you hear about us?
      </span>
      <div role="group" aria-labelledby={id} className={`${FIELD_GAP[size]} flex flex-wrap gap-2`}>
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? "" : o)}
              className={`rounded-full border px-3 py-1 text-xs ${
                size === "creator" ? "font-medium" : "font-semibold"
              } transition-colors ${
                on
                  ? "border-[#2563eb] bg-[#EFF4FF] text-[#2563eb]"
                  : "border-[#D1D5DB] bg-white text-[#374151]"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
      <input type="hidden" name="heardAbout" value={value} />
    </div>
  );
}

/* ------------------------------------------------------------- buttons --- */

const PROVIDER_BUTTON =
  "flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-[14px] border border-[#E5E7EB] bg-white text-[15px] font-semibold text-[#111827] transition-all hover:border-[#D1D5DB] hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60";
const PROVIDER_SHADOW = { boxShadow: "0 2px 6px rgba(15,23,42,0.05)" };

export function ProviderButtons({
  role,
  onEmail,
  available,
}: {
  role: "influencer" | "saas";
  onEmail: () => void;
  available: ProviderAvailability;
}) {
  return (
    <>
      <SharedProviderButtons verb="Sign up" role={role} available={available} />
      <button type="button" onClick={onEmail} className={PROVIDER_BUTTON} style={PROVIDER_SHADOW}>
        <svg viewBox="0 0 24 24" className="size-[18px] text-[#4B5563]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m2 7 10 6 10-6" />
        </svg>
        <span>Sign up with email</span>
      </button>
    </>
  );
}

export function BackToOptions({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[#4B5563] transition-colors duration-200 hover:text-[#111827]"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M19 12H5m7-7-7 7 7 7" />
      </svg>
      Back to sign-up options
    </button>
  );
}

export function SignInLine({ size }: { size: Size }) {
  return (
    <p className={`text-center text-xs ${size === "creator" ? "text-[#6B7280]" : "text-[#64748b]"}`}>
      Already have an account?{" "}
      <a
        href="/login"
        className={`text-[#2563eb] ${size === "creator" ? "font-medium" : "font-semibold"}`}
      >
        Sign in here
      </a>
    </p>
  );
}

export function ErrorNote({ error, provider }: { error?: string; provider?: string }) {
  if (!error) return null;
  const label = provider === "linkedin_oidc" ? "LinkedIn" : provider === "google" ? "Google" : "That provider";
  const message =
    error === "unconfigured"
      ? `${label} sign-in isn't available right now. Use your email address below.`
      : error === "denied"
        ? "The sign-in was cancelled."
        : error === "unverified"
          ? `${label} did not confirm that email address, so we cannot use it to sign you in.`
          : error === "state"
            ? "That sign-in link expired. Please try again."
            : `${label} could not complete the sign-in. Please try again.`;

  return (
    <p
      role="alert"
      className="rounded-[10px] border border-[#F2D6C8] bg-[#FDF6F1] px-3.5 py-2.5 text-sm leading-5 text-[#8A4B22]"
    >
      {message}
    </p>
  );
}

/* --------------------------------------------------------------- state --- */

/** The sign-up fields both flows collect, in one hook so the card can watch them. */
export function useSignupFields() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [heard, setHeard] = useState("");
  return { firstName, setFirstName, lastName, setLastName, email, setEmail, password, setPassword, heard, setHeard };
}

/* --------------------------------------------------------------- icons --- */


