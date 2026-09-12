"use client";

import { useState } from "react";

/**
 * The Google and LinkedIn buttons, on sign-in and on sign-up.
 *
 * They are not removed while the providers are switched off, because removing
 * them would change the page — naano shows three ways in, and a screen with
 * only email is a different product. They stay, visibly unavailable, and say so
 * when you press them.
 *
 * `available` comes from the server, derived from whether real credentials
 * exist. That is the whole switch: the day the OAuth apps are registered, the
 * buttons work with no code change, and nothing here has to be remembered and
 * undone.
 */

export type ProviderAvailability = { google: boolean; linkedin: boolean };

const BUTTON =
  "flex h-12 w-full items-center justify-center gap-3 rounded-[14px] border border-[#E5E7EB] bg-white text-[15px] font-semibold text-[#111827] transition-all";
const LIVE = "cursor-pointer hover:border-[#D1D5DB] hover:bg-[#F9FAFB]";
// Unavailable, not broken: still legible, visibly not the way forward.
const OFF = "cursor-not-allowed text-[#9CA3AF] opacity-70";
const SHADOW = { boxShadow: "0 2px 6px rgba(15,23,42,0.05)" };
const NOTICE_ID = "provider-unavailable";

export function ProviderButtons({
  verb,
  role,
  available,
}: {
  /** "Sign up" on /register, "Continue" on /login — naano words them differently. */
  verb: "Sign up" | "Continue";
  role?: "influencer" | "saas";
  available: ProviderAvailability;
}) {
  const [notice, setNotice] = useState<string | null>(null);
  const preposition = verb === "Sign up" ? "with" : "with";

  const href = (provider: string) =>
    `/api/auth/oauth/start?provider=${provider}${role ? `&role=${role}` : ""}`;

  const unavailable = (name: string) =>
    setNotice(`${name} sign-in isn't available right now. Use your email address below.`);

  const item = (
    key: "google" | "linkedin",
    name: string,
    provider: string,
    glyph: React.ReactNode
  ) =>
    available[key] ? (
      <a key={key} href={href(provider)} className={`${BUTTON} ${LIVE}`} style={SHADOW}>
        {glyph}
        <span>
          {verb} {preposition} {name}
        </span>
      </a>
    ) : (
      <button
        key={key}
        type="button"
        // Neither `disabled` nor `aria-disabled`. Both say "this control does
        // nothing", and a control that swallows the press has no way to tell
        // you why — which is the entire job here. It IS operable: pressing it
        // produces an answer. The dimmed styling carries "not the way in", and
        // aria-describedby ties the button to that answer once it exists.
        aria-describedby={notice ? NOTICE_ID : undefined}
        onClick={() => unavailable(name)}
        className={`${BUTTON} ${OFF}`}
        style={SHADOW}
      >
        <span className="opacity-50">{glyph}</span>
        <span>
          {verb} {preposition} {name}
        </span>
      </button>
    );

  return (
    <div className="space-y-3">
      {item("linkedin", "LinkedIn", "linkedin_oidc", <LinkedInGlyph />)}
      {item("google", "Google", "google", <GoogleGlyph />)}

      {notice ? (
        <p id={NOTICE_ID} role="status" className="text-center text-[13px] text-[#6B7280]">
          {notice}
        </p>
      ) : null}
    </div>
  );
}

/* lucide has no brand marks, so these two are drawn from the official ones. */

export function LinkedInGlyph() {
  return (
    <span className="grid size-[18px] place-items-center rounded-[3px] bg-[#0A66C2]" aria-hidden>
      <svg viewBox="0 0 24 24" className="size-3 text-white" fill="currentColor">
        <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0ZM.24 8.25h4.5V24h-4.5V8.25Zm7.5 0h4.31v2.15h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9V24h-4.5v-7.9c0-1.88-.03-4.3-2.62-4.3-2.62 0-3.02 2.05-3.02 4.16V24h-4.5V8.25Z" />
      </svg>
    </span>
  );
}

export function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.87c2.26-2.09 3.56-5.17 3.56-8.87Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.87-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l3.99-3.09Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  );
}
