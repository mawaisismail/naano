"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, Check, Copy, IdCard, Link2, Users, Wallet } from "lucide-react";

/**
 * /creator/affiliate — naano's affiliate screen, authored from theirs.
 *
 *   toggle    Invite brands | Invite creators
 *   hero      chip, a ~64px centred headline, lead, "Copy my referral link"
 *             in black beside "See how it works"
 *   link card the personal link, a TRACKED arrow, and the commission rail
 *   stats     rewards earned, brands introduced, earning now
 *   two ways  "Recommend Naano" (most common) and "Share your Creator Card"
 *   paid      three numbered steps
 *   simulator a black result card beside two sliders
 *   tracking  the introduced brands, or the empty state
 *
 * The simulator is real arithmetic, not a fixed picture: naano's own figures
 * (€5,000 a month across 2 brands → €1,500 over three months) fall out of
 * volume x 20% commission x 25% share x brands x 3 months, which is the note
 * printed under their card.
 */

const SHARE = 0.25;
const COMMISSION = 0.2;
const MONTHS = 3;

export function AffiliateScreen({
  code,
  origin,
  cardPath,
  rewardsEarned,
  brandsIntroduced,
  earningNow,
  referred,
}: {
  code: string;
  /** Resolved on the server so both renders print the same link. */
  origin: string;
  cardPath: string;
  rewardsEarned: number;
  brandsIntroduced: number;
  earningNow: number;
  referred: { id: string; name: string; joined: string }[];
}) {
  const [audience, setAudience] = useState<"brands" | "creators">("brands");
  const [volume, setVolume] = useState(5000);
  const [brands, setBrands] = useState(2);
  const [copied, setCopied] = useState<string | null>(null);

  const path = audience === "brands" ? `/invite/${code}` : `/invite/${code}?as=creator`;
  const link = () => `${origin}${path}`;
  const display = `${origin.replace(/^https?:\/\//, "")}${path}`;

  const copy = async (what: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  };

  const perMonth = Math.round(volume * COMMISSION * SHARE * brands);
  const potential = perMonth * MONTHS;
  const euro = (n: number) => `€${n.toLocaleString("en-GB")}`;

  return (
    <div className="-mx-8 -mt-2 px-8 pb-20 pt-2" style={{ background: "#FBFAF8" }}>
      <div className="mx-auto max-w-[1100px]">
        {/* --------------------------------------------------------- toggle */}
        <div className="flex justify-center pt-6">
          <div className="inline-flex rounded-[14px] border border-[#EAE7E1] bg-[#F3F1EC] p-1.5">
            {(["brands", "creators"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAudience(a)}
                aria-pressed={audience === a}
                className={`inline-flex items-center gap-2 rounded-[10px] px-6 py-2.5 text-sm transition-colors ${
                  audience === a ? "bg-white font-semibold text-[#111827] shadow-sm" : "font-medium text-[#6B7280]"
                }`}
              >
                {a === "brands" ? <Building2 size={16} strokeWidth={1.8} aria-hidden /> : <Users size={16} strokeWidth={1.8} aria-hidden />}
                {a === "brands" ? "Invite brands" : "Invite creators"}
              </button>
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------------- hero */}
        <div className="mt-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#EAE7E1] bg-white px-4 py-1.5 text-[13px] text-[#4B5563]">
            <span className="size-1.5 rounded-full bg-[#2563eb]" />
            Creator affiliation · 25% for 3 months
          </span>
          <h1 className="mx-auto mt-8 max-w-[820px] text-[clamp(38px,5vw,64px)] font-bold leading-[1.08] tracking-[-0.03em] text-[#111827]">
            Recommend Naano. Earn for 3 months.
          </h1>
          <p className="mx-auto mt-5 max-w-[640px] text-[15px] leading-[26px] text-[#6B7280]">
            Share your personal link with a {audience === "brands" ? "company" : "creator"}. If it joins
            Naano and launches paid campaigns, you receive 25% of Naano&apos;s
            commission for three months.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => copy("hero", link())}
              className="inline-flex items-center gap-2.5 rounded-[12px] bg-[#111827] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#1F2937]"
            >
              <Copy size={16} strokeWidth={1.8} aria-hidden />
              {copied === "hero" ? "Link copied" : "Copy my referral link"}
            </button>
            <a href="#how" className="inline-flex items-center gap-2 text-[15px] font-medium text-[#111827]">
              See how it works <span aria-hidden>→</span>
            </a>
          </div>
        </div>

        {/* ------------------------------------------------------ link card */}
        <section className="mt-14 rounded-[20px] border border-[#E6EBF5] bg-[#F7FAFF] p-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-[16px] border border-[#EAE7E1] bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-[10px] bg-[#111827] text-white">
                  <Building2 size={18} strokeWidth={1.8} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    Introduce a {audience === "brands" ? "company" : "creator"} to Naano
                  </p>
                  <p className="text-[13px] text-[#6B7280]">Your link identifies you automatically</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-[12px] bg-[#F5F6F8] px-4 py-3">
                <Link2 size={16} strokeWidth={1.8} aria-hidden className="shrink-0 text-[#6B7280]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF]">
                    Your personal referral link
                  </span>
                  <span className="block truncate text-sm text-[#2563eb]">{display}</span>
                </span>
                <Check size={16} strokeWidth={2} aria-hidden className="shrink-0 text-[#16A34A]" />
              </div>

              <button
                type="button"
                onClick={() => copy("card", link())}
                className="mt-3 inline-flex items-center gap-2 text-[13px] font-medium text-[#6B7280] transition-colors hover:text-[#111827]"
              >
                <Copy size={14} strokeWidth={1.8} aria-hidden />
                {copied === "card" ? "Copied" : "Copy link"}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">
              <span className="hidden h-px w-8 bg-[#D7DEEA] lg:block" />
              <span className="size-1.5 rounded-full bg-[#9DB2D6]" />
              Tracked
              <span className="hidden h-px w-8 bg-[#D7DEEA] lg:block" />
            </div>

            <div className="rounded-[16px] border border-[#EAE7E1] bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF]">
                    Your share of Naano&apos;s commission
                  </p>
                  <p className="mt-2 text-[38px] font-bold leading-none tracking-[-0.02em] text-[#111827]">25%</p>
                </div>
                <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-[#EFF4FF] text-[#2563eb]">
                  <Wallet size={18} strokeWidth={1.8} aria-hidden />
                </span>
              </div>
              <hr className="my-5 border-[#EEF0F4]" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Reward period</span>
                <span className="font-bold text-[#111827]">3 months</span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-[13px] text-[#6B7280]">
            The three-month reward period starts after the company&apos;s first
            completed paid campaign.
          </p>
        </section>

        {/* ---------------------------------------------------------- stats */}
        <div className="mt-5 grid overflow-hidden rounded-[18px] border border-[#EAE7E1] bg-white sm:grid-cols-3">
          <Stat label="Rewards earned" value={`€${rewardsEarned.toFixed(2)}`} />
          <Stat label="Brands introduced" value={String(brandsIntroduced)} note={`${referred.length} have generated rewards`} divided />
          <Stat label="Earning now" value={String(earningNow)} note="Inside the three-month window" />
        </div>

        {/* ------------------------------------------------------- two ways */}
        <section className="mt-16">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">
            <span className="size-1.5 rounded-full bg-[#9DB2D6]" />
            Two ways to introduce a brand
          </p>
          <h2 className="mt-4 max-w-[560px] text-[40px] font-bold leading-[1.12] tracking-[-0.025em] text-[#111827]">
            Choose the link that fits the conversation.
          </h2>
          <p className="mt-3 text-[15px] text-[#6B7280]">
            Both options are tracked and pay you 25% of Naano&apos;s commission
            for three months.
          </p>

          <div className="mt-8 overflow-hidden rounded-[18px] border border-[#E6EBF5]">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F2F7FF] p-6">
              <div className="flex min-w-0 items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-white text-[#2563eb]">
                  <Building2 size={18} strokeWidth={1.8} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[17px] font-bold text-[#111827]">Recommend Naano</span>
                    <span className="rounded-[6px] bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
                      Most common
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-[#4B5563]">
                    Use your Naano link when a company wants to discover creators
                    or start influencer marketing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copy("naano", link())}
                className="inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-[#6B7280] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4B5563]"
              >
                <Copy size={15} strokeWidth={1.8} aria-hidden />
                {copied === "naano" ? "Copied" : "Copy Naano link"}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E6EBF5] bg-white p-6">
              <div className="flex min-w-0 items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-[#F5F6F8] text-[#4B5563]">
                  <IdCard size={18} strokeWidth={1.8} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[17px] font-bold text-[#111827]">Share your Creator Card</p>
                  <p className="mt-1 text-sm text-[#4B5563]">
                    Use your Deal Link when a brand already wants to collaborate
                    with you. Your profile stays selected when it creates its
                    account.
                  </p>
                </div>
              </div>
              <Link
                href={cardPath}
                className="inline-flex shrink-0 items-center gap-2 rounded-[10px] border border-[#E5E7EB] px-5 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:border-[#9CA3AF]"
              >
                Open My Card <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- how you pay */}
        <section id="how" className="mt-16 scroll-mt-8">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">
            <span className="size-1.5 rounded-full bg-[#9DB2D6]" />
            How you get paid
          </p>
          <h2 className="mt-4 max-w-[520px] text-[40px] font-bold leading-[1.12] tracking-[-0.025em] text-[#111827]">
            Share once. Naano tracks the rest.
          </h2>

          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {[
              ["Share the right link", "Use your Naano link for an introduction, or your Creator Card for a direct collaboration."],
              ["They launch a campaign", "The company creates its account and completes its first paid campaign."],
              ["Earn for 3 months", "You receive 25% of Naano's commission on its eligible campaigns."],
            ].map(([title, body], i) => (
              <li key={title} className={i > 0 ? "sm:border-l sm:border-[#EAE7E1] sm:pl-8" : ""}>
                <span className="grid size-8 place-items-center rounded-full border border-[#DDE6F5] text-[11px] font-bold text-[#2563eb]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-4 text-[17px] font-bold text-[#111827]">{title}</p>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ------------------------------------------------------ simulator */}
        <section className="mt-14 grid overflow-hidden rounded-[20px] border border-[#E6EBF5] bg-[#F7FAFF] lg:grid-cols-2">
          <div className="p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">
              Reward simulator
            </p>
            <h2 className="mt-3 max-w-[320px] text-[34px] font-bold leading-[1.14] tracking-[-0.025em] text-[#111827]">
              What could your network earn?
            </h2>

            <div className="mt-7 rounded-[16px] bg-[#111827] p-7 text-white">
              <p className="text-[13px] text-white/70">Potential over 3 months</p>
              <p className="mt-2 text-[44px] font-bold leading-none tracking-[-0.02em]">{euro(potential)}</p>
              <hr className="my-5 border-white/15" />
              <p className="text-[13px] text-white/70">{euro(perMonth)} estimated per month</p>
            </div>

            <p className="mt-5 text-[13px] leading-5 text-[#6B7280]">
              Illustrative estimate using a 20% Naano commission. Your actual
              reward is always 25% of the commission Naano realizes on eligible
              campaigns.
            </p>
          </div>

          <div className="border-t border-[#E6EBF5] p-8 lg:border-l lg:border-t-0">
            <Slider
              label="Monthly paid campaign volume per brand"
              value={volume}
              min={1000}
              max={25000}
              step={500}
              onChange={setVolume}
              display={euro(volume)}
              minLabel="€1,000"
              maxLabel="€25,000"
            />
            <div className="mt-10">
              <Slider
                label="Active referred brands"
                value={brands}
                min={1}
                max={10}
                step={1}
                onChange={setBrands}
                display={String(brands)}
                minLabel="1"
                maxLabel="10"
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- tracking */}
        <section className="mt-16">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">
            <span className="size-1.5 rounded-full bg-[#9DB2D6]" />
            Live tracking
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-[#EAE7E1] pb-6">
            <h2 className="text-[40px] font-bold leading-[1.12] tracking-[-0.025em] text-[#111827]">
              Your introduced brands
            </h2>
            <p className="text-right">
              <span className="block text-[22px] font-bold text-[#111827]">€{rewardsEarned.toFixed(2)}</span>
              <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF]">
                Total earned
              </span>
            </p>
          </div>

          {referred.length === 0 ? (
            <div className="py-10">
              <p className="text-[17px] font-bold text-[#111827]">Your first brand will appear here</p>
              <p className="mt-2 text-sm text-[#6B7280]">
                Share your referral link. Signup, reward window and earnings will
                update here automatically.
              </p>
              <button
                type="button"
                onClick={() => copy("tracking", link())}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb]"
              >
                <Copy size={15} strokeWidth={1.8} aria-hidden />
                {copied === "tracking" ? "Link copied" : "Copy my referral link"}
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#F1F2F5]">
              {referred.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 py-4">
                  <span className="text-sm font-semibold text-[#111827]">{r.name}</span>
                  <span className="text-[13px] text-[#6B7280]">Joined {r.joined}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, note, divided }: { label: string; value: string; note?: string; divided?: boolean }) {
  return (
    <div className={`p-6 ${divided ? "sm:border-x sm:border-[#EAE7E1]" : ""}`}>
      <p className="text-sm text-[#6B7280]">{label}</p>
      <p className="mt-2 text-[30px] font-bold tracking-[-0.02em] text-[#111827]">{value}</p>
      {note ? <p className="mt-1 text-[13px] text-[#9CA3AF]">{note}</p> : null}
    </div>
  );
}

function Slider({
  label, value, min, max, step, onChange, display, minLabel, maxLabel,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
  minLabel: string;
  maxLabel: string;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <label htmlFor={label} className="max-w-[260px] text-[15px] text-[#374151]">
          {label}
        </label>
        <span className="text-[17px] font-bold text-[#111827]">{display}</span>
      </div>
      <input
        id={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-4 w-full accent-[#2563eb]"
      />
      <div className="mt-1 flex justify-between text-[11px] text-[#9CA3AF]">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
