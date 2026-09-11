"use client";

import { useState } from "react";
import { Metric, NumberField, Placeholder, ResultGrid, SelectField, Verdict } from "@/components/tools/fields";
import { BANDS, deliveryOdds, euros } from "@/lib/tool-data";

const num = (s: string) => {
  const v = Number(s);
  return Number.isFinite(v) && v > 0 ? v : 0;
};

export function OddsCalculator() {
  const [offer, setOffer] = useState("");
  const [bandLabel, setBandLabel] = useState(BANDS[2].label);

  const band = BANDS.find((b) => b.label === bandLabel) ?? BANDS[2];
  const o = num(offer);
  const ready = o > 0 && band.medianCost > 0;

  const odds = deliveryOdds(o, band);
  const ratio = ready ? o / band.medianCost : 1;
  const tone = ratio >= 1 ? "good" : ratio >= 0.75 ? "ok" : "low";

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <NumberField id="odds-offer" label="What you plan to offer per post" hint="Flat fee, in euros" placeholder="e.g. 150" value={offer} onChange={setOffer} prefix="€" />
        <SelectField id="odds-band" label="Creator audience size" value={bandLabel} onChange={setBandLabel} options={BANDS.map((b) => b.label)} />
      </div>

      <div aria-live="polite" className="mt-8">
        {!ready ? (
          <Placeholder>
            Enter the fee you plan to offer and the audience size you are
            targeting — the share of offers at that price that end in a published
            post appears here, next to what creators in that band actually list.
          </Placeholder>
        ) : (
          <>
            <ResultGrid>
              <Metric label="Published" value={`${Math.round(odds.published * 100)}%`} tone="brand" note="Offers at this price that ended in a live post" />
              <Metric label="Never answered" value={`${Math.round(odds.ignored * 100)}%`} note="Creators who did not reply at all" />
              <Metric label="Declined" value={`${Math.round(odds.declined * 100)}%`} note="Answered, but turned the brief down" />
            </ResultGrid>
            <Verdict tone={tone}>
              {tone === "good" ? (
                <>
                  <strong>At or above the market.</strong> Creators in{" "}
                  {band.label.toLowerCase()} list a median of {euros(band.medianCost)} per
                  post, so {euros(o)} lands as a serious offer and most of these bookings
                  reach publication.
                </>
              ) : tone === "ok" ? (
                <>
                  <strong>Slightly under the market.</strong> The median in{" "}
                  {band.label.toLowerCase()} is {euros(band.medianCost)}. At {euros(o)} you
                  will get posts published, but expect to send more briefs per published post.
                </>
              ) : (
                <>
                  <strong>Well under the market.</strong> {euros(o)} is far below the{" "}
                  {euros(band.medianCost)} median in {band.label.toLowerCase()}. Most of
                  that gap turns into silence rather than a negotiation — budget for a
                  smaller audience band instead.
                </>
              )}
            </Verdict>
          </>
        )}
      </div>
    </>
  );
}
