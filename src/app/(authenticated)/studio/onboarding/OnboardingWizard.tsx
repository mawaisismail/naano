"use client";

import { useState } from "react";
import { CreatorCard } from "@/components/CreatorCard";
import { VERTICALS, COUNTRIES, type Creator } from "@/lib/creators";
import { slugify } from "@/lib/slug";
import { completeOnboarding } from "./actions";
import { euro, cx } from "@/lib/format";

const STEPS = ["You", "Your audience", "Your topics", "Your price"] as const;

const ICP_OPTIONS = [
  "Founders", "AEs", "Sales leaders", "RevOps leads", "CROs",
  "Backend engineers", "Platform teams", "CTOs", "PMs", "Heads of Product",
  "Designers", "Demand gen leads", "CMOs", "Growth", "People leads",
  "Talent partners", "Finance leads", "CFOs", "COOs", "Ops leads",
];

export function OnboardingWizard({ name: initialName }: { name: string }) {
  const [step, setStep] = useState(0);

  const [name, setName] = useState(initialName);
  const [headline, setHeadline] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]?.code ?? "IE");
  const [verticals, setVerticals] = useState<string[]>([]);
  const [icp, setIcp] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [followers, setFollowers] = useState(5000);
  const [medianViews, setMedianViews] = useState(4000);
  const [reactions, setReactions] = useState(80);
  const [comments, setComments] = useState(12);
  const [postCost, setPostCost] = useState(180);

  const chosenCountry = COUNTRIES.find((c) => c.code === country);
  const slug = slugify(name);

  // The card updates as you type — this is the point of the wizard. A creator
  // is deciding how they appear to buyers, so they should see it, not imagine it.
  const preview: Creator = {
    id: "preview",
    slug,
    name: name || "Your name",
    headline: headline || "Your LinkedIn headline",
    avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${slug}&backgroundColor=e8f0fe,dceaff,f3f4f6`,
    country: chosenCountry?.name ?? "",
    countryCode: chosenCountry?.code ?? "",
    flag: chosenCountry?.flag ?? "🌍",
    verticals: verticals.length ? verticals : ["Your topics"],
    bio: bio || "Tell brands what you write about, and who reads it.",
    followers,
    medianViews,
    postCost,
    matchScore: 75,
    engagementRate: medianViews ? Number(((reactions / medianViews) * 100).toFixed(2)) : 0,
    reactionsPerPost: reactions,
    commentsPerPost: comments,
    icp,
  };

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const canAdvance =
    step === 0 ? name.trim().length > 1 && headline.trim().length > 3
    : step === 2 ? verticals.length > 0
    : true;

  const last = step === STEPS.length - 1;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="nn-eyebrow">Step {step + 1} of {STEPS.length}</div>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">
        Set up your marketplace profile
      </h1>
      <p className="mt-1.5 text-muted">
        This is what brands see when they search for creators. You can change it later.
      </p>

      {/* progress */}
      <ol className="mt-7 flex gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <div
              className={cx(
                "h-1.5 rounded-full transition-colors",
                i <= step ? "bg-brand" : "bg-line"
              )}
            />
            <span
              className={cx(
                "mt-2 block text-[11px] font-semibold",
                i === step ? "text-brand" : "text-grey"
              )}
            >
              {s}
            </span>
          </li>
        ))}
      </ol>

      <form action={completeOnboarding} className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* every field is submitted regardless of which step is visible */}
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="headline" value={headline} />
        <input type="hidden" name="bio" value={bio} />
        <input type="hidden" name="country" value={chosenCountry?.name ?? ""} />
        <input type="hidden" name="countryCode" value={chosenCountry?.code ?? ""} />
        <input type="hidden" name="flag" value={chosenCountry?.flag ?? "🌍"} />
        <input type="hidden" name="verticals" value={verticals.join(",")} />
        <input type="hidden" name="icp" value={icp.join(",")} />
        <input type="hidden" name="followers" value={followers} />
        <input type="hidden" name="medianViews" value={medianViews} />
        <input type="hidden" name="reactionsPerPost" value={reactions} />
        <input type="hidden" name="commentsPerPost" value={comments} />
        <input type="hidden" name="postCost" value={postCost} />

        <div className="nn-card p-7">
          {step === 0 && (
            <div className="space-y-5">
              <Field label="Your name">
                <input value={name} onChange={(e) => setName(e.target.value)} className={input} />
              </Field>
              <Field label="LinkedIn headline">
                <input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="RevOps for Series A-C. Clean data, real forecasts."
                  className={input}
                />
              </Field>
              <Field label="Country">
                <select value={country} onChange={(e) => setCountry(e.target.value)} className={input}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                  ))}
                </select>
              </Field>
              <p className="rounded-lg bg-surface/60 p-3 text-xs text-muted">
                The real product imports this from your LinkedIn profile. That
                scraping step is deliberately not built, so it is entered by hand.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <Num label="Followers" value={followers} onChange={setFollowers} min={0} max={5_000_000} step={100} />
              <Num label="Typical impressions per post" value={medianViews} onChange={setMedianViews} min={0} max={2_000_000} step={100} />
              <Num label="Reactions per post" value={reactions} onChange={setReactions} min={0} max={50_000} step={5} />
              <Num label="Comments per post" value={comments} onChange={setComments} min={0} max={10_000} step={1} />
              <div className="rounded-lg bg-brand-soft/50 p-3 text-xs text-brand">
                Engagement rate: <strong>{preview.engagementRate}%</strong> — reactions ÷ impressions.
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Field label="What you write about">
                <div className="flex flex-wrap gap-1.5">
                  {VERTICALS.map((v) => (
                    <Chip key={v} on={verticals.includes(v)} onClick={() => toggle(verticals, setVerticals, v)}>
                      {v}
                    </Chip>
                  ))}
                </div>
              </Field>
              <Field label="Who you target (est.)">
                <div className="flex flex-wrap gap-1.5">
                  {ICP_OPTIONS.map((v) => (
                    <Chip key={v} on={icp.includes(v)} onClick={() => toggle(icp, setIcp, v)}>
                      {v}
                    </Chip>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <Field label={`Cost per post — ${euro(postCost)}`}>
                <input
                  type="range" min={20} max={1500} step={10} value={postCost}
                  onChange={(e) => setPostCost(Number(e.target.value))}
                  className="w-full accent-[#1652f0]"
                />
                <div className="mt-1 flex justify-between text-[11px] text-grey">
                  <span>€20</span><span>€1,500</span>
                </div>
                <p className="mt-3 text-xs text-muted">
                  Median for your audience size is{" "}
                  <strong className="text-ink">
                    {euro(followers < 5000 ? 84 : followers < 10000 ? 180 : followers < 25000 ? 312 : 620)}
                  </strong>
                  . You set your own price.
                </p>
              </Field>
              <Field label="About you">
                <textarea
                  rows={5} value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="Two or three sentences on what you write about and why brands should trust your audience."
                  className={input}
                />
              </Field>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:text-ink disabled:invisible"
            >
              ← Back
            </button>

            {last ? (
              <button
                type="submit"
                className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
              >
                Publish my profile
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance}
                className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:bg-grey"
              >
                Continue →
              </button>
            )}
          </div>
        </div>

        {/* live preview */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="nn-eyebrow mb-2.5">Your marketplace card</div>
          <CreatorCard creator={preview} rank={1} />
          <p className="mt-3 text-xs text-grey">
            Updates as you type. This is exactly what a brand sees.
          </p>
        </aside>
      </form>
    </div>
  );
}

const input =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-grey focus:border-brand";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="nn-eyebrow mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function Num({
  label, value, onChange, min, max, step,
}: {
  label: string; value: number; onChange: (n: number) => void;
  min: number; max: number; step: number;
}) {
  return (
    <Field label={label}>
      <input
        type="number" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))}
        className={input}
      />
    </Field>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={on}
      className={cx(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        on ? "border-brand bg-brand text-white" : "border-line bg-white text-muted hover:border-grey hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
