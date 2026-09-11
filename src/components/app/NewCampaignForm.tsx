"use client";

import { useState } from "react";
import Link from "next/link";
import type { Creator } from "@/lib/creators";
import { draftBrief, OBJECTIVES, type ObjectiveId } from "@/lib/brief";
import { createCampaign } from "@/app/app/campaigns/actions";
import { euro, compact } from "@/lib/format";

export function NewCampaignForm({
  creators,
  company,
}: {
  creators: Creator[];
  company: string;
}) {
  const [name, setName] = useState("");
  const [product, setProduct] = useState(company);
  const [objective, setObjective] = useState<ObjectiveId>("trials");
  const [landingUrl, setLandingUrl] = useState("");
  const [brief, setBrief] = useState({ objectives: "", keyMessages: "", guidelines: "" });
  const [drafted, setDrafted] = useState(false);

  const total = creators.reduce((s, c) => s + c.postCost, 0);
  const reach = creators.reduce((s, c) => s + c.medianViews, 0);

  const draft = () => {
    setBrief(draftBrief({ company, product: product || company, objective, creators }));
    setDrafted(true);
  };

  return (
    <form action={createCampaign} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <input type="hidden" name="creatorIds" value={creators.map((c) => c.id).join(",")} />

      <div className="space-y-6">
        <section className="nn-card p-7">
          <h2 className="font-display text-lg font-bold text-ink">Campaign</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Campaign name">
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Q3 pipeline push"
                className={inputCls}
              />
            </Field>
            <Field label="Product being promoted">
              <input
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder={company}
                className={inputCls}
              />
            </Field>
            <Field label="Objective">
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value as ObjectiveId)}
                className={inputCls}
              >
                {OBJECTIVES.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Landing URL">
              <input
                name="landingUrl"
                value={landingUrl}
                onChange={(e) => setLandingUrl(e.target.value)}
                placeholder="https://yourdomain.com/trial"
                className={inputCls}
              />
            </Field>
          </div>
        </section>

        <section className="nn-card p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Brief</h2>
              <p className="mt-1 text-sm text-muted">
                Drafted from your objective and the creators you picked. Edit anything.
              </p>
            </div>
            <button
              type="button"
              onClick={draft}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              {drafted ? "Redraft" : "Draft the brief"}
            </button>
          </div>

          {drafted ? (
            <div className="mt-6 space-y-5">
              <Field label="Objectives">
                <textarea name="objectives" rows={4} className={inputCls}
                  value={brief.objectives}
                  onChange={(e) => setBrief({ ...brief, objectives: e.target.value })} />
              </Field>
              <Field label="Key messages">
                <textarea name="keyMessages" rows={5} className={inputCls}
                  value={brief.keyMessages}
                  onChange={(e) => setBrief({ ...brief, keyMessages: e.target.value })} />
              </Field>
              <Field label="Creator guidelines">
                <textarea name="guidelines" rows={7} className={inputCls}
                  value={brief.guidelines}
                  onChange={(e) => setBrief({ ...brief, guidelines: e.target.value })} />
              </Field>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-line bg-surface/40 p-8 text-center">
              <p className="text-sm text-muted">
                Nothing drafted yet. The brief adapts to the verticals of the creators
                you selected.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ------------------------------------------------------------- summary */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="nn-card p-6">
          <div className="nn-eyebrow">Booking</div>
          <div className="mt-3 space-y-3">
            {creators.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.avatar} alt="" width={32} height={32}
                  className="size-8 rounded-full bg-brand-soft" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{c.name}</div>
                  <div className="text-[11px] text-muted">
                    {compact(c.followers)} followers
                  </div>
                </div>
                <div className="font-display text-sm font-bold text-ink">
                  {euro(c.postCost)}
                </div>
              </div>
            ))}
          </div>

          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <Row k="Creators" v={String(creators.length)} />
            <Row k="Est. reach" v={`${compact(reach)} views`} />
            <Row k="Total" v={euro(total)} strong />
          </dl>

          <button
            type="submit"
            disabled={!drafted}
            className="mt-6 w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-grey"
          >
            Send briefs &amp; invite {creators.length}
          </button>
          {!drafted && (
            <p className="mt-2 text-center text-[11px] text-grey">Draft the brief first</p>
          )}
          <Link href="/marketplace"
            className="mt-3 block text-center text-xs font-medium text-muted hover:text-ink">
            Back to marketplace
          </Link>
        </div>
      </aside>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-grey focus:border-brand";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="nn-eyebrow mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{k}</dt>
      <dd className={strong ? "font-display font-bold text-brand" : "font-medium text-ink"}>{v}</dd>
    </div>
  );
}
