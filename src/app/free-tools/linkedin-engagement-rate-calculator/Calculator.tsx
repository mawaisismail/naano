"use client";

import { useState } from "react";
import { Metric, NumberField, Placeholder, ResultGrid, Verdict } from "@/components/tools/fields";
import { bandFor, pct } from "@/lib/tool-data";

const num = (s: string) => {
  const v = Number(s);
  return Number.isFinite(v) && v > 0 ? v : 0;
};

export function EngagementCalculator() {
  const [followers, setFollowers] = useState("");
  const [reactions, setReactions] = useState("");
  const [comments, setComments] = useState("");
  const [reposts, setReposts] = useState("");
  const [impressions, setImpressions] = useState("");

  const f = num(followers);
  const engagements = num(reactions) + num(comments) + num(reposts);
  const ready = f > 0 && engagements > 0;

  const byFollowers = ready ? (engagements / f) * 100 : 0;
  const imp = num(impressions);
  const byImpressions = ready && imp > 0 ? (engagements / imp) * 100 : null;

  const band = bandFor(f || 1);
  const [lo, hi] = band.good;
  const tone = byFollowers > hi ? "good" : byFollowers >= lo ? "ok" : "low";

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <NumberField id="erc-followers" label="Follower count" placeholder="e.g. 4500" value={followers} onChange={setFollowers} wide />
        <NumberField id="erc-reactions" label="Average reactions per post" hint="Over your last ~10 posts" placeholder="e.g. 85" value={reactions} onChange={setReactions} />
        <NumberField id="erc-comments" label="Average comments per post" hint="Over your last ~10 posts" placeholder="e.g. 20" value={comments} onChange={setComments} />
        <NumberField id="erc-reposts" label="Average reposts per post" hint="Over your last ~10 posts" placeholder="e.g. 5" value={reposts} onChange={setReposts} />
        <NumberField id="erc-impressions" label="Average impressions per post" hint="Optional — from LinkedIn analytics" placeholder="e.g. 6000" value={impressions} onChange={setImpressions} />
      </div>

      <div aria-live="polite" className="mt-8">
        {!ready ? (
          <Placeholder>
            Enter your follower count and your per-post averages above — your
            engagement rate appears here instantly, rated against 2026 B2B
            benchmarks for your audience size.
          </Placeholder>
        ) : (
          <>
            <ResultGrid>
              <Metric label="By followers" value={pct(byFollowers, 2)} tone="brand" note={`${engagements.toLocaleString("en-GB")} engagements ÷ ${f.toLocaleString("en-GB")} followers`} />
              <Metric label="By impressions" value={byImpressions === null ? "—" : pct(byImpressions, 2)} note={byImpressions === null ? "Add impressions to see this" : `${engagements.toLocaleString("en-GB")} engagements ÷ ${imp.toLocaleString("en-GB")} impressions`} />
              <Metric label="Your tier" value={`${lo}–${hi}%`} note={`Healthy range for ${band.label.toLowerCase()}`} />
            </ResultGrid>
            <Verdict tone={tone}>
              {tone === "good" ? (
                <>
                  <strong>Excellent.</strong> At {pct(byFollowers, 2)} you are above the
                  healthy range for {band.label.toLowerCase()}. This is the number to lead
                  with when a sponsor asks why your flat fee is what it is.
                </>
              ) : tone === "ok" ? (
                <>
                  <strong>Healthy.</strong> {pct(byFollowers, 2)} sits inside the{" "}
                  {lo}–{hi}% range for {band.label.toLowerCase()}. Posting on a steady
                  rhythm and replying to every comment in the first hour is what moves it up.
                </>
              ) : (
                <>
                  <strong>Below benchmark.</strong> {pct(byFollowers, 2)} is under the{" "}
                  {lo}–{hi}% range for {band.label.toLowerCase()}. Narrow the topic, write
                  for one job title, and cut the posts that ask for nothing.
                </>
              )}
            </Verdict>
          </>
        )}
      </div>
    </>
  );
}
