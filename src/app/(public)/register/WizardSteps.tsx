"use client";

import { useActionState, useState } from "react";
import {
  createMarketplaceProfile,
  finishLater,
  goToStep,
  importLinkedIn,
  saveIndustries,
  saveProfessionalInfo,
  type WizardState,
} from "@/lib/actions/onboarding";
import { INDUSTRIES } from "@/lib/linkedin-import";

/**
 * Steps 2 to 4 of naano's creator wizard, plus the optional professional
 * details that follow. They all live on /register?role=influencer, which is
 * where naano keeps them — the URL never changes as the wizard advances.
 *
 * Authored from their screens:
 *   kicker  12 / 600 uppercase .05em #2563eb, "Step N of 4"
 *   h1      24 / 700 #111827
 *   lead    14 / 20 #6B7280
 *   back    14 / 500 #4B5563 with a left arrow
 *   note    1px #E0E7FF on #F5F8FF, radius 14, 13 / 20 #4B5563
 *   input   1px #D1D5DB, radius 10, px-3 py-2, 14px
 *   cta     full width, radius 10, 14 / 600, white on #2563eb
 */

const KICKER = "text-xs font-semibold uppercase tracking-wide text-[#2563eb]";
const H1 = "text-2xl font-bold text-[#111827]";
const LEAD = "text-sm leading-6 text-[#6B7280]";
const INPUT =
  "w-full rounded-[10px] border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563eb]";
const CTA =
  "w-full cursor-pointer rounded-[10px] bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50";
const GHOST =
  "w-full cursor-pointer rounded-[10px] border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:border-[#9CA3AF]";

function Back({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[#4B5563] transition-colors duration-200 hover:text-[#111827]"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M19 12H5m7-7-7 7 7 7" />
      </svg>
      {label}
    </button>
  );
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-[10px] border border-[#F2D6C8] bg-[#FDF6F1] px-3.5 py-2.5 text-sm leading-5 text-[#8A4B22]">
      {children}
    </p>
  );
}

/**
 * The banner that keeps the demo data honest. It appears on every screen that
 * shows an imported figure, and reads from profileDataSource, so it disappears
 * of its own accord the day a real LinkedIn import is wired in.
 */
export function DemoDataNote({ source }: { source: string }) {
  if (source !== "demo") return null;
  return (
    <div className="rounded-[10px] border border-[#F2E2C0] bg-[#FDFAF2] px-3.5 py-2.5 text-[13px] leading-5 text-[#7A5A1E]">
      <strong className="font-semibold">Demo data.</strong> This build has no
      LinkedIn API access, so the profile, follower count and price below are
      generated for the MVP rather than read from LinkedIn. They are stored and
      labelled as demo, and are replaced the moment the import is connected.
    </div>
  );
}

/* ------------------------------------------------------------- step 2 --- */

export function StepLinkedIn({ defaultUrl }: { defaultUrl: string | null }) {
  const [state, action, pending] = useActionState<WizardState, FormData>(importLinkedIn, null);

  return (
    <form action={action} className="space-y-4">
      <Back label="Back to my account" onClick={() => history.back()} />
      <div className={KICKER}>Step 2 of 4</div>
      <h1 className={H1}>Add your public LinkedIn profile</h1>
      <p className={LEAD}>
        No extension is needed. We&apos;ll retrieve only the minimum public
        information required to create your Basic card.
      </p>

      {state?.error ? <Alert>{state.error}</Alert> : null}

      <div>
        <label htmlFor="linkedinUrl" className="text-xs font-semibold uppercase tracking-wide text-[#5C5B57]">
          Public LinkedIn profile URL
        </label>
        <div className="mt-1">
          <input
            id="linkedinUrl"
            name="linkedinUrl"
            required
            defaultValue={defaultUrl ?? ""}
            placeholder="https://www.linkedin.com/in/you"
            className={INPUT}
          />
        </div>
      </div>

      <div className="flex gap-2.5 rounded-[14px] border border-[#E0E7FF] bg-[#F5F8FF] px-4 py-3.5">
        <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-[#2563eb]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3Z" />
        </svg>
        <p className="text-[13px] leading-5 text-[#4B5563]">
          By clicking below, you authorize Naano to read your public profile
          once: name, photo, headline, country and follower count. We do not
          import your posts, engagement or private analytics.
        </p>
      </div>

      <DemoDataNote source="demo" />

      <button disabled={pending} className={CTA}>
        {pending ? "Reading your profile…" : "Import my public profile"}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------- step 3 --- */

export function StepIndustries({ selected }: { selected: string[] }) {
  const [state, action, pending] = useActionState<WizardState, FormData>(saveIndustries, null);
  const [picked, setPicked] = useState<string[]>(selected);

  const toggle = (v: string) =>
    setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : p.length >= 5 ? p : [...p, v]));

  return (
    <form action={action} className="space-y-4">
      <Back label="Back to my LinkedIn profile" onClick={() => goToStep(2)} />
      <div className={KICKER}>Step 3 of 4</div>
      <h1 className={H1}>Pick your industries</h1>
      <p className={LEAD}>
        Brands filter the marketplace by these. Choose up to five that describe
        what your audience actually reads you for.
      </p>

      {state?.error ? <Alert>{state.error}</Alert> : null}

      <input type="hidden" name="industries" value={picked.join(",")} />
      <div className="flex flex-wrap gap-2">
        {INDUSTRIES.map((v) => {
          const on = picked.includes(v);
          return (
            <button
              key={v}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(v)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                on
                  ? "border-[#2563eb] bg-[#EFF4FF] text-[#2563eb]"
                  : "border-[#D1D5DB] bg-white text-[#374151]"
              }`}
            >
              {v}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-[#9CA3AF]">{picked.length} of 5 selected</p>

      <button disabled={pending || picked.length === 0} className={CTA}>
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------- step 4 --- */

export function StepCard({
  followers,
  headline,
  avatarUrl,
  recommended,
  source,
}: {
  followers: number;
  headline: string;
  avatarUrl: string;
  recommended: number;
  source: string;
}) {
  const [state, action, pending] = useActionState<WizardState, FormData>(
    createMarketplaceProfile,
    null
  );
  const [price, setPrice] = useState(String(recommended));

  return (
    <form action={action} className="space-y-4">
      <div className={KICKER}>Step 4 of 4</div>
      <h1 className={H1}>Complete your creator card</h1>

      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt="" className="size-12 shrink-0 rounded-full object-cover" />
        <div className="min-w-0">
          <p className="text-sm text-[#6B7280]">
            <strong className="text-[15px] font-bold text-[#111827]">
              {followers.toLocaleString("en-GB")}
            </strong>{" "}
            followers
          </p>
          <p className="mt-0.5 line-clamp-3 text-[13px] leading-5 text-[#6B7280]">{headline}</p>
        </div>
      </div>

      <Back label="Edit my industries" onClick={() => goToStep(3)} />

      {state?.error ? <Alert>{state.error}</Alert> : null}
      <DemoDataNote source={source} />

      <div className="rounded-[18px] border border-[#E5E7EB] p-6 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#2563eb]">
          Our recommendation
        </div>
        <p className="mx-auto mt-3 max-w-[340px] text-sm leading-6 text-[#6B7280]">
          Naano recommends this starting price from the public audience and
          performance information currently available. You can change it now or
          later.
        </p>
        <div className="mt-5 rounded-[14px] bg-[#F7F8FA] px-6 py-6">
          <label htmlFor="postCost" className="sr-only">
            Price per post in euros
          </label>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-medium text-[#111827]">€</span>
            <input
              id="postCost"
              name="postCost"
              type="number"
              min={20}
              max={5000}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-[150px] border-none bg-transparent text-center text-5xl font-bold tracking-[-0.03em] text-[#111827] focus:outline-none"
            />
            <span className="text-sm text-[#6B7280]">/ post</span>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-[#9CA3AF]">
          This is your net price per post. You can change it at any time from
          your Naano profile.
        </p>
      </div>

      <button disabled={pending} className={CTA}>
        {pending ? "Creating your profile…" : "Create my marketplace profile"}
      </button>
      <button type="button" className={GHOST} onClick={() => goToStep(3)}>
        Add a bundle (optional)
      </button>
    </form>
  );
}

/* -------------------------------------------- optional professional step --- */

export function StepProfessional({ country }: { country: string | null }) {
  const [state, action, pending] = useActionState<WizardState, FormData>(
    saveProfessionalInfo,
    null
  );
  const [hasBusiness, setHasBusiness] = useState<"yes" | "no">("no");

  return (
    <form action={action} className="space-y-4">
      <h1 className={H1}>Would you like to complete your professional information now?</h1>
      <p className={LEAD}>
        This step is optional now. You can complete it later from your profile,
        before applying to paid campaigns, accepting bookings, invoicing or
        withdrawing your earnings.
      </p>

      {state?.error ? <Alert>{state.error}</Alert> : null}

      <div className="rounded-[14px] border border-[#E5E7EB] p-4">
        <p className="text-[13px] leading-5 text-[#4B5563]">
          You can enter Naano now. Your workspace and Marketplace card stay
          accessible. Complete the required professional information before
          applying to paid campaigns, accepting bookings, invoicing or
          withdrawing your earnings.
        </p>
        <button
          type="button"
          onClick={() => finishLater()}
          className="mt-4 w-full cursor-pointer rounded-[10px] border border-[#2563eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#2563eb] transition-colors hover:bg-[#F5F8FF]"
        >
          Go to my workspace — finish later
        </button>
      </div>

      <div className="space-y-3 rounded-[14px] border border-[#E5E7EB] p-4 text-[13px] leading-5 text-[#4B5563]">
        <p>
          <strong className="font-semibold text-[#111827]">France and European Union:</strong>{" "}
          a registered professional activity is required to invoice companies and
          withdraw your earnings.
        </p>
        <p>
          <strong className="font-semibold text-[#111827]">
            United States and outside the European Union:
          </strong>{" "}
          a registered business is not mandatory. You can continue as an
          individual and add professional information if you have it.
        </p>
      </div>

      <div className="text-xs font-semibold uppercase tracking-wide text-[#5C5B57]">
        Business (professional accounts only)
      </div>

      <div className="space-y-4 rounded-[14px] border border-[#E5E7EB] p-4">
        <div>
          <label htmlFor="businessCountry" className="block text-sm text-[#374151]">
            Registration country
          </label>
          <input
            id="businessCountry"
            name="businessCountry"
            defaultValue={country ?? ""}
            className={`${INPUT} mt-1.5 bg-[#F7F8FA]`}
          />
        </div>

        <fieldset>
          <legend className="text-sm text-[#374151]">Do you have a registered business?</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-3">
            {(["yes", "no"] as const).map((v) => (
              <label
                key={v}
                className={`flex cursor-pointer items-center gap-2 rounded-[10px] border px-4 py-2.5 text-sm ${
                  hasBusiness === v
                    ? "border-[#2563eb] bg-[#F5F8FF] text-[#2563eb]"
                    : "border-[#D1D5DB] text-[#374151]"
                }`}
              >
                <input
                  type="radio"
                  name="hasBusiness"
                  value={v}
                  checked={hasBusiness === v}
                  onChange={() => setHasBusiness(v)}
                  className="accent-[#2563eb]"
                />
                {v === "yes" ? "Yes" : "No"}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="legalName" className="block text-sm text-[#374151]">
            Legal name
          </label>
          <input id="legalName" name="legalName" placeholder="Full name or company name" className={`${INPUT} mt-1.5`} />
        </div>
        <div>
          <label htmlFor="legalAddress" className="block text-sm text-[#374151]">
            Legal address
          </label>
          <input id="legalAddress" name="legalAddress" placeholder="Full billing address" className={`${INPUT} mt-1.5`} />
        </div>

        <label className="flex items-start gap-2.5 rounded-[10px] border border-[#F2E2C0] bg-[#FDFAF2] px-3.5 py-3 text-[13px] leading-5 text-[#4B5563]">
          <input type="checkbox" name="taxDeclaration" className="mt-0.5 accent-[#2563eb]" />
          I confirm that I am solely responsible for declaring and paying taxes
          on this income to the tax authorities in my country.
        </label>
        <label className="flex items-start gap-2.5 rounded-[10px] border border-[#E5E7EB] px-3.5 py-3 text-[13px] leading-5 text-[#4B5563]">
          <input type="checkbox" name="invoiceMandate" className="mt-0.5 accent-[#2563eb]" />
          I authorize Naano to issue invoices in my name and on my behalf for
          the campaigns I deliver.
        </label>
      </div>

      <button disabled={pending} className={CTA}>
        {pending ? "Saving…" : "Save and go to my workspace"}
      </button>

      {/* The same escape hatch as the panel above, repeated at the bottom of a
          long form. Someone who scrolls all the way down and decides they do
          not have the details to hand should not have to scroll back up to
          find the way out. formAction is used rather than onClick so it still
          works before hydration. */}
      <button type="submit" formAction={finishLater} className={GHOST}>
        Complete later — go to my dashboard
      </button>
    </form>
  );
}
