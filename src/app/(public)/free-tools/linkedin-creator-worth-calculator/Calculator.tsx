"use client";

import { useState } from "react";
import { Metric, NumberField, Placeholder, ResultGrid, SelectField, Verdict } from "@/components/tools/fields";
import { bandFor, euros, pct } from "@/lib/tool-data";

/**
 * Flat-fee estimate for one sponsored post.
 *
 * The band median from this project's marketplace is the anchor; engagement
 * relative to the band's healthy range moves it, and the niche applies the
 * demand multiplier B2B buyers actually pay in this dataset.
 */
const NICHES = {
  "Sales / GTM": 1.1,
  "RevOps": 1.15,
  "DevTools / Engineering": 1.25,
  "HR-Tech / People": 1,
  "Product": 1.05,
  "Marketing Ops": 1.05,
  "Fintech": 1.2,
  "Other B2B": 0.95,
} as const;

const num = (s: string) => {
  const v = Number(s);
  return Number.isFinite(v) && v > 0 ? v : 0;
};

export function WorthCalculator() {
  const [followers, setFollowers] = useState("");
  const [reactions, setReactions] = useState("");
  const [comments, setComments] = useState("");
  const [niche, setNiche] = useState<keyof typeof NICHES>("Sales / GTM");

  const f = num(followers);
  const engagements = num(reactions) + num(comments);
  const ready = f > 0 && engagements > 0;

  const band = bandFor(f || 1);
  const er = ready ? (engagements / f) * 100 : 0;
  const [lo, hi] = band.good;
  const mid = (lo + hi) / 2;

  // Engagement moves the fee within a 0.6x–1.6x collar around the band median.
  const quality = ready ? Math.min(1.6, Math.max(0.6, er / mid)) : 1;
  const base = band.medianCost * quality * NICHES[niche];
  const low = Math.round((base * 0.85) / 10) * 10;
  const high = Math.round((base * 1.2) / 10) * 10;

  const tone = er > hi ? "good" : er >= lo ? "ok" : "low";

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <NumberField id="cwc-followers" label="Follower count" placeholder="e.g. 8200" value={followers} onChange={setFollowers} wide />
        <NumberField id="cwc-reactions" label="Average reactions per post" hint="Over the last ~10 posts" placeholder="e.g. 210" value={reactions} onChange={setReactions} />
        <NumberField id="cwc-comments" label="Average comments per post" hint="Over the last ~10 posts" placeholder="e.g. 34" value={comments} onChange={setComments} />
        <SelectField id="cwc-niche" label="Niche" hint="What the audience is there to read about" value={niche} onChange={(v) => setNiche(v as keyof typeof NICHES)} options={Object.keys(NICHES)} wide />
      </div>

      <div aria-live="polite" className="mt-8">
        {!ready ? (
          <Placeholder>
            Enter a follower count and the creator&apos;s per-post averages — a
            flat-fee range for one sponsored post appears here, with the
            engagement rating it is based on.
          </Placeholder>
        ) : (
          <>
            <ResultGrid>
              <Metric label="Fee per post" value={`${euros(low)}–${euros(high)}`} tone="brand" note="Flat fee for one sponsored post" />
              <Metric label="Engagement rate" value={pct(er, 2)} note={`Healthy for this tier: ${lo}–${hi}%`} />
              <Metric label="Band median" value={euros(band.medianCost)} note={`${band.label}, ${band.n} creators in this dataset`} />
            </ResultGrid>
            <Verdict tone={tone}>
              {tone === "good" ? (
                <>
                  <strong>Priced above the band.</strong> Engagement of {pct(er, 2)} beats the{" "}
                  {lo}–{hi}% healthy range for {band.label.toLowerCase()}, which is what
                  carries this estimate above the {euros(band.medianCost)} median.
                </>
              ) : tone === "ok" ? (
                <>
                  <strong>Priced at the band.</strong> {pct(er, 2)} sits inside the{" "}
                  {lo}–{hi}% range, so the estimate tracks the {euros(band.medianCost)}{" "}
                  median for {band.label.toLowerCase()}.
                </>
              ) : (
                <>
                  <strong>Priced below the band.</strong> {pct(er, 2)} is under the{" "}
                  {lo}–{hi}% range for {band.label.toLowerCase()}, so a sponsor comparing
                  like for like will expect a fee under the {euros(band.medianCost)} median.
                </>
              )}
            </Verdict>
          </>
        )}
      </div>
    </>
  );
}
