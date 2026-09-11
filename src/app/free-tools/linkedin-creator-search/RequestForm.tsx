"use client";

import { useState } from "react";
import Link from "next/link";
import { NumberField, Placeholder, SelectField, TextField } from "@/components/tools/fields";
import { BANDS, euros } from "@/lib/tool-data";
import { CREATORS } from "@/lib/creators";

/**
 * The free creator search. naano's runs on their own team; ours does the part
 * that can honestly be automated — it matches the brief against this build's
 * marketplace and shows the shortlist immediately, then offers the full search.
 */

const VERTICALS = [
  "Sales", "RevOps", "DevTools", "HR-Tech", "Product", "Marketing Ops", "Fintech", "Vertical SaaS",
] as const;

export function CreatorSearchForm() {
  const [email, setEmail] = useState("");
  const [vertical, setVertical] = useState<string>(VERTICALS[0]);
  const [budget, setBudget] = useState("");
  const [brief, setBrief] = useState("");
  const [sent, setSent] = useState(false);

  const b = Number(budget) > 0 ? Number(budget) : 0;
  const matches = CREATORS.filter((c) => c.verticals.some((v) => v === vertical))
    .filter((c) => (b > 0 ? c.postCost <= b : true))
    .sort((x, y) => y.matchScore - x.matchScore)
    .slice(0, 5);

  const valid = /.+@.+\..+/.test(email) && brief.trim().length >= 20;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="cs-email" label="Work email" hint="Where the shortlist gets sent" placeholder="you@company.com" value={email} onChange={setEmail} />
        <SelectField id="cs-vertical" label="Audience you want to reach" value={vertical} onChange={setVertical} options={VERTICALS} />
        <NumberField id="cs-budget" label="Budget per post" hint="Optional — filters the shortlist" placeholder="e.g. 250" value={budget} onChange={setBudget} prefix="€" />
        <TextField id="cs-brief" label="What are you launching?" hint="Product, buyer, and what a good post would say — 20 characters minimum" placeholder="We sell an onboarding tool to RevOps leads at Series B SaaS companies…" value={brief} onChange={setBrief} rows={4} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!valid}
          onClick={() => setSent(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#1652F0] px-6 py-3 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#1240D0] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Get my shortlist
        </button>
        <span className="text-[13px] text-[#6B6D74]">Free · No account · No payment method</span>
      </div>

      <div aria-live="polite" className="mt-8">
        {!sent ? (
          <Placeholder>
            Describe the campaign above. You get an instant shortlist from the
            creators listed here, and the full search — including creators
            outside the marketplace — follows within 48 hours.
          </Placeholder>
        ) : (
          <div className="rounded-[14px] border border-[#ECEAE6] bg-[#FAFAF9] p-5">
            <p className="text-[15px] leading-[1.6] text-[#17181C]">
              <strong>Request received.</strong> This is a demo build, so nothing
              is emailed and no data leaves your browser — here is the instant
              shortlist the search starts from.
            </p>
            {matches.length === 0 ? (
              <p className="mt-4 text-[15px] leading-[1.6] text-[#55575E]">
                Nothing in {vertical} under {euros(b)} per post. The median in
                the 5,000–20,000 band is {euros(BANDS[2].medianCost)} — try that
                as a budget, or widen the audience.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-[#ECEAE6]">
                {matches.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                    <Link href={`/creators/${c.slug}`} className="text-[15px] font-semibold text-[#17181C] hover:text-[#1652F0]">
                      {c.name}
                    </Link>
                    <span className="text-[13px] text-[#6B6D74]">
                      {c.followers.toLocaleString("en-GB")} followers · {c.engagementRate}% engagement · {euros(c.postCost)} per post
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/marketplace"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-[#E4E1DC] bg-white px-5 py-3 text-[15px] font-semibold text-[#17181C] transition-colors hover:border-[#D8D4CE]"
            >
              See the whole marketplace
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
