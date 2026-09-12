"use client";

import { useActionState, useState } from "react";
import { Briefcase, Send, Share2 } from "lucide-react";
import { MarketplaceCard } from "@/app/(public)/register/MarketplaceCard";
import { updateCard, type WizardState } from "@/lib/actions/onboarding";
import { INDUSTRIES } from "@/lib/linkedin-import";

/**
 * /creator/card — the storefront screen, authored from naano's.
 *
 *   header   kicker 12 / 700 uppercase .12em #2563eb, h1 32 / 700 -0.02em,
 *            lead 15 / 26 #6B7280 over a max-w-[660px]
 *   toggle   Edit | Preview segmented control, top right
 *   panel    radius 20 on a #F5F8FF wash with a #E3EAF8 hairline; kicker with
 *            a dot, h2 34 / 700, two white sub-cards, a black pill CTA, and a
 *            right rail carrying the affiliate terms
 *   card     the live marketplace card beneath, centred
 *
 * The toggle is real: Preview is the card as a brand sees it, Edit is the
 * three things worth changing after the wizard — price, headline, industries.
 * A segmented control that only switches a label would be decoration.
 */

/** naano's published affiliate terms, shown on this screen. */
const AFFILIATE_SHARE = "25%";
const AFFILIATE_PERIOD = "3 months";

type CardUser = {
  name: string;
  headline: string | null;
  avatarUrl: string | null;
  followers: number | null;
  postCost: number | null;
  industries: string[];
  flag: string | null;
  creatorSlug: string | null;
};

export function CardWorkbench({ user }: { user: CardUser }) {
  const [mode, setMode] = useState<"edit" | "preview">("preview");
  const [state, action, pending] = useActionState<WizardState, FormData>(updateCard, null);
  const [copied, setCopied] = useState(false);

  const [price, setPrice] = useState(String(user.postCost ?? ""));
  const [headline, setHeadline] = useState(user.headline ?? "");
  const [picked, setPicked] = useState<string[]>(user.industries);

  const dealPath = user.creatorSlug ? `/creators/${user.creatorSlug}` : "/creator/card";
  const dealUrl = () =>
    typeof window === "undefined" ? dealPath : new URL(dealPath, window.location.origin).toString();

  const shareDealLink = async () => {
    const data = { title: "My Naano card", url: dealUrl() };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        return; // sheet dismissed
      }
    }
    try {
      await navigator.clipboard.writeText(dealUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const toggleIndustry = (v: string) =>
    setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : p.length >= 5 ? p : [...p, v]));

  return (
    <div className="mx-auto max-w-[1340px] pt-2">
      <div className="rounded-[22px] border border-[#E9EBF0] bg-white p-8">
        {/* ------------------------------------------------------- header */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2563eb]">
              Your creator storefront
            </p>
            <h1 className="mt-2 text-[32px] font-bold tracking-[-0.02em] text-[#111827]">
              Your Naano card, ready to travel.
            </h1>
            <p className="mt-2 max-w-[660px] text-[15px] leading-[26px] text-[#6B7280]">
              Share clear proof of your positioning, audience and offers. Every
              improvement makes the card more useful to brands.
            </p>
          </div>

          <div className="inline-flex shrink-0 rounded-[12px] border border-[#E5E7EB] bg-white p-1">
            {(["edit", "preview"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`rounded-[9px] px-5 py-2 text-sm transition-colors ${
                  mode === m
                    ? "bg-[#F3F4F6] font-semibold text-[#111827]"
                    : "font-medium text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {m === "edit" ? "Edit" : "Preview"}
              </button>
            ))}
          </div>
        </div>

        {/* --------------------------------------------------- deal link */}
        <section className="mt-8 overflow-hidden rounded-[20px] border border-[#E3EAF8] bg-[#F5F8FF] p-8">
          <div className="flex flex-wrap justify-between gap-10">
            <div className="min-w-0 max-w-[640px] flex-1">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#7A879E]">
                <span className="size-1.5 rounded-full bg-[#9DB2D6]" />
                Your card is your deal link
              </p>
              <h2 className="mt-4 text-[34px] font-bold leading-[1.15] tracking-[-0.02em] text-[#111827]">
                Put it on LinkedIn. Earn when a brand joins through it.
              </h2>
              <p className="mt-3 max-w-[560px] text-[15px] leading-[26px] text-[#6B7280]">
                Your public card presents your profile and keeps you selected
                when a brand creates its account.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Tip
                  icon={<Briefcase size={18} strokeWidth={1.8} aria-hidden />}
                  title="Add it as a LinkedIn experience"
                  body="Keep your card visible on your profile so brands can discover and book you."
                />
                <Tip
                  icon={<Send size={18} strokeWidth={1.8} aria-hidden />}
                  title="Send it when a brand contacts you"
                  body="When you receive a collaboration request, share your card so the deal runs through Naano."
                />
              </div>

              <button
                type="button"
                onClick={shareDealLink}
                className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-[#111827] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#1F2937]"
              >
                <Share2 size={17} strokeWidth={1.8} aria-hidden />
                {copied ? "Deal Link copied" : "Copy or share my Deal Link"}
              </button>
            </div>

            <div className="shrink-0 self-start rounded-[16px] bg-white/70 px-8 py-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
                Your share
              </p>
              <p className="mt-1 text-[36px] font-bold tracking-[-0.02em] text-[#111827]">
                {AFFILIATE_SHARE}
              </p>
              <hr className="my-5 border-[#E3EAF8]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
                Reward period
              </p>
              <p className="mt-1 text-[24px] font-bold tracking-[-0.02em] text-[#111827]">
                {AFFILIATE_PERIOD}
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ card or editor */}
        {mode === "preview" ? (
          <div className="mt-10 flex justify-center pb-2">
            <MarketplaceCard
              name={user.name}
              headline={headline || user.headline}
              avatarUrl={user.avatarUrl}
              followers={user.followers}
              postCost={user.postCost}
              industries={picked}
              flag={user.flag}
              costLabel="Chosen cost"
              postDataPill
            />
          </div>
        ) : (
          <form action={action} className="mt-10 grid gap-10 lg:grid-cols-2">
            <div className="space-y-5">
              {state?.error ? (
                <p role="alert" className="rounded-[10px] border border-[#F2D6C8] bg-[#FDF6F1] px-3.5 py-2.5 text-sm leading-5 text-[#8A4B22]">
                  {state.error}
                </p>
              ) : null}

              <div>
                <label htmlFor="headline" className="text-xs font-semibold uppercase tracking-wide text-[#5C5B57]">
                  Headline
                </label>
                <textarea
                  id="headline"
                  name="headline"
                  rows={3}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="mt-1.5 w-full rounded-[10px] border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  The first thing a brand reads. {headline.length} characters.
                </p>
              </div>

              <div>
                <label htmlFor="postCost" className="text-xs font-semibold uppercase tracking-wide text-[#5C5B57]">
                  Price per post
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-lg text-[#6B7280]">€</span>
                  <input
                    id="postCost"
                    name="postCost"
                    type="number"
                    min={20}
                    max={5000}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-[140px] rounded-[10px] border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  />
                  <span className="text-sm text-[#6B7280]">/ post, net to you</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#5C5B57]">
                  Industries
                </span>
                <input type="hidden" name="industries" value={picked.join(",")} />
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {INDUSTRIES.map((v) => {
                    const on = picked.includes(v);
                    return (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleIndustry(v)}
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
              </div>

              <button
                disabled={pending}
                className="rounded-[10px] bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
              >
                {pending ? "Saving…" : "Save my card"}
              </button>
            </div>

            <div className="flex justify-center">
              <MarketplaceCard
                name={user.name}
                headline={headline}
                avatarUrl={user.avatarUrl}
                followers={user.followers}
                postCost={Number(price) || user.postCost}
                industries={picked}
                flag={user.flag}
                costLabel="Chosen cost"
                postDataPill
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Tip({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-[14px] border border-[#E6ECF7] bg-white p-5">
      <span className="grid size-9 place-items-center rounded-[10px] bg-[#EFF4FF] text-[#2563eb]">
        {icon}
      </span>
      <p className="mt-3.5 text-[15px] font-semibold text-[#111827]">{title}</p>
      <p className="mt-1.5 text-[13px] leading-5 text-[#6B7280]">{body}</p>
    </div>
  );
}
