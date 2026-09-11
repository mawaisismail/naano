"use client";

import { useState } from "react";
import { Metric, NumberField, Placeholder, ResultGrid, SelectField, Verdict } from "@/components/tools/fields";
import { BANDS, deliveryOdds, euros } from "@/lib/tool-data";

const num = (s: string) => {
  const v = Number(s);
  return Number.isFinite(v) && v > 0 ? v : 0;
};

export function BudgetPlanner() {
  const [budget, setBudget] = useState("");
  const [bandLabel, setBandLabel] = useState(BANDS[2].label);

  const band = BANDS.find((b) => b.label === bandLabel) ?? BANDS[2];
  const b = num(budget);
  const ready = b > 0 && band.medianCost > 0;

  const booked = ready ? Math.floor(b / band.medianCost) : 0;
  const odds = deliveryOdds(band.medianCost, band);
  const published = Math.round(booked * odds.published);
  const costPerPublished = published > 0 ? b / published : 0;

  const tone = published >= 5 ? "good" : published >= 2 ? "ok" : "low";

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <NumberField id="bp-budget" label="Campaign budget" hint="Total, in euros" placeholder="e.g. 3000" value={budget} onChange={setBudget} prefix="€" />
        <SelectField id="bp-band" label="Creator audience size" value={bandLabel} onChange={setBandLabel} options={BANDS.map((x) => x.label)} />
      </div>

      <div aria-live="polite" className="mt-8">
        {!ready ? (
          <Placeholder>
            Enter a budget and the audience size you want to book — you get the
            number of posts it books at the real median fee, how many of those
            historically end up published, and the true cost per published post.
          </Placeholder>
        ) : (
          <>
            <ResultGrid>
              <Metric label="Posts booked" value={String(booked)} note={`At ${euros(band.medianCost)} median in ${band.label.toLowerCase()}`} />
              <Metric label="Posts published" value={String(published)} tone="brand" note={`${Math.round(odds.published * 100)}% of bookings at this price reach publication`} />
              <Metric label="True cost per post" value={published > 0 ? euros(costPerPublished) : "—"} note="Budget ÷ published posts" />
            </ResultGrid>
            <Verdict tone={tone}>
              {published >= 5 ? (
                <>
                  <strong>Enough posts to read the data.</strong> {published} published
                  posts is around the point where click-through differences between
                  creators stop being noise, so you can decide who to re-book on evidence.
                </>
              ) : published >= 2 ? (
                <>
                  <strong>A pilot, not a campaign.</strong> {published} published posts
                  will tell you whether the channel works at all, but not which creator
                  to double down on. Budget for five before drawing conclusions.
                </>
              ) : (
                <>
                  <strong>Too thin to learn from.</strong> At {euros(b)} in{" "}
                  {band.label.toLowerCase()} you land under two published posts. Either
                  raise the budget or move down a band, where {euros(BANDS[1].medianCost)}{" "}
                  buys a post instead of {euros(band.medianCost)}.
                </>
              )}
            </Verdict>
          </>
        )}
      </div>
    </>
  );
}
