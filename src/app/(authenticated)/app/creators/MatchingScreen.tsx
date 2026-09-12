"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowUp, Info, Sparkles, Store } from "lucide-react";
import { compact, euro } from "@/lib/format";

/**
 * The AI Matching screen. Client-side only for the prompt box and the
 * matching/marketplace switch; the ranking itself is done on the server, so
 * what a brand sees is reproducible and can be linked to.
 */

export type MatchCard = {
  id: string;
  slug: string;
  name: string;
  headline: string;
  avatar: string;
  flag: string;
  country: string;
  verticals: string[];
  followers: number;
  medianViews: number;
  postCost: number;
  engagementRate: number;
  score: number;
  reasons: string[];
  matched: number;
  total: number;
};

const SUGGESTIONS = [
  "RevOps leaders in France",
  "Creators who post about outbound",
  "Product people with 10K+ followers",
  "HR-tech audiences in DACH",
];

export function MatchingScreen({
  company,
  query,
  view,
  icps,
  matches,
}: {
  company: string;
  query: string;
  view: "matching" | "marketplace";
  icps: string[];
  matches: MatchCard[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [text, setText] = useState(query);

  const go = (next: { q?: string; view?: string }) => {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    router.push(`/app/creators?${sp.toString()}`);
  };

  // The marketplace view is the same people, ordered by reach rather than by
  // fit — which is exactly what "browse everyone" means.
  const shown =
    view === "marketplace" ? [...matches].sort((a, b) => b.followers - a.followers) : matches;

  return (
    <div className="px-8 pb-16 pt-2">
      <h1 className="max-w-[760px] text-[40px] font-bold leading-[1.15] tracking-[-0.02em] text-[#111827]">
        Hey {company}, let&rsquo;s find the right creators for you.
      </h1>

      {/* ------------------------------------------------------- prompt box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go({ q: text, view: "matching" });
        }}
        className="mt-6 max-w-[760px] rounded-[18px] border border-[#E5E7EB] bg-white p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.5)]"
      >
        <label htmlFor="matching-prompt" className="sr-only">
          Describe the creators you are looking for
        </label>
        <textarea
          id="matching-prompt"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Describe who you want to reach — “RevOps leaders at Series B companies in France”"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          className="w-full resize-none border-0 bg-transparent text-[15px] leading-6 text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
        />
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="inline-flex items-center gap-2 text-[12px] text-[#9CA3AF]">
            <Info size={13} strokeWidth={1.8} aria-hidden />
            Matches are scored from your ICPs — no model is called.
          </span>
          <button
            aria-label="Find creators"
            className="grid size-9 place-items-center rounded-full bg-[#111827] text-white transition-colors hover:bg-black"
          >
            <ArrowUp size={16} strokeWidth={2.2} aria-hidden />
          </button>
        </div>
      </form>

      <div className="mt-3 flex max-w-[760px] flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setText(s);
              go({ q: s, view: "matching" });
            }}
            className="rounded-full border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#4B5563] transition-colors hover:border-[#9CA3AF] hover:text-[#111827]"
          >
            {s}
          </button>
        ))}
      </div>

      {/* ----------------------------------------------------------- toggle */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-[12px] border border-[#E5E7EB] bg-white p-1">
          {(
            [
              ["matching", "AI Matching", Sparkles],
              ["marketplace", "Creator Marketplace", Store],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => go({ view: key })}
              aria-pressed={view === key}
              className={`inline-flex items-center gap-2 rounded-[9px] px-4 py-2 text-sm transition-colors ${
                view === key ? "bg-[#F5F8FF] font-semibold text-[#2563eb]" : "font-medium text-[#4B5563]"
              }`}
            >
              <Icon size={15} strokeWidth={1.8} aria-hidden />
              {label}
            </button>
          ))}
        </div>

        <p className="text-[13px] text-[#6B7280]">
          {shown.length} creators ·{" "}
          {view === "matching"
            ? query
              ? `ranked for “${query}”`
              : `ranked against ${icps.length} ICP${icps.length === 1 ? "" : "s"}`
            : "ordered by reach"}
        </p>
      </div>

      {/* ------------------------------------------------------------ cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((c) => (
          <article key={c.id} className="flex flex-col rounded-[18px] border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.avatar} alt="" className="size-12 rounded-full bg-[#F3F4F6]" />
              <span className="rounded-full bg-[#EFF4FF] px-2.5 py-1 text-[11px] font-bold text-[#2563eb]">
                {c.score}% ICP match
              </span>
            </div>

            <p className="mt-3.5 text-[15px] font-bold text-[#111827]">{c.name}</p>
            <p className="mt-0.5 text-[12px] text-[#9CA3AF]">
              {c.flag} {c.country} · {c.verticals.join(" · ")}
            </p>
            <p className="mt-2.5 line-clamp-2 text-[13px] leading-5 text-[#6B7280]">{c.headline}</p>

            <dl className="mt-4 grid grid-cols-3 gap-2 rounded-[12px] bg-[#F7F8FA] p-3 text-center">
              <Metric label="Followers" value={compact(c.followers)} />
              <Metric label="Med. views" value={compact(c.medianViews)} />
              <Metric label="Engagement" value={`${c.engagementRate.toFixed(1)}%`} />
            </dl>

            {/* The reason has to distinguish one card from the next, so it
                leads with the count and the creator's own beat rather than
                repeating the same ICP title down the whole column. The full
                list of matched ICPs is on the title attribute. */}
            <p className="mt-3 text-[12px] leading-5 text-[#6B7280]" title={c.reasons.join(" · ")}>
              <span className="font-semibold text-[#4B5563]">Why:</span>{" "}
              {c.total > 0 ? `matches ${c.matched} of ${c.total} ICPs · ` : ""}
              {c.verticals[0]} audience
            </p>

            <div className="mt-4 flex items-center justify-between gap-3 pt-1">
              <span className="text-sm font-bold text-[#111827]">
                {euro(c.postCost)}
                <span className="ml-1 text-[12px] font-medium text-[#9CA3AF]">/ post</span>
              </span>
              <Link
                href={`/creators/${c.slug}`}
                className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
              >
                View card
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="text-[15px] font-bold text-[#111827]">{value}</dd>
      <dt className="mt-0.5 text-[11px] text-[#9CA3AF]">{label}</dt>
    </div>
  );
}
