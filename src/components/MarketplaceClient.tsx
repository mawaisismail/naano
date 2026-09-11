"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CreatorCard } from "@/components/CreatorCard";
import { VERTICALS, TIERS, COUNTRIES, followerTier, type Creator } from "@/lib/creators";
import { euro, cx } from "@/lib/format";

type Sort = "match" | "price-asc" | "price-desc" | "reach";

export function MarketplaceClient({ creators: CREATORS }: { creators: Creator[] }) {
  const router = useRouter();
  const params = useSearchParams();

  // Filters live in the URL so a filtered view can be shared, bookmarked and
  // walked back through with the browser's own back button.
  const [q, setQ] = useState(() => params.get("q") ?? "");
  const [verticals, setVerticals] = useState<string[]>(
    () => params.get("v")?.split(",").filter(Boolean) ?? []
  );
  const [tiers, setTiers] = useState<string[]>(
    () => params.get("t")?.split(",").filter(Boolean) ?? []
  );
  const [country, setCountry] = useState(() => params.get("c") ?? "");
  const [maxPrice, setMaxPrice] = useState(() => Number(params.get("max") ?? 1500));
  const [sort, setSort] = useState<Sort>(() => (params.get("s") as Sort) ?? "match");
  const [selected, setSelected] = useState<string[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  // Debounced, because the search box and the price slider both fire per
  // keystroke / per drag and each push would otherwise become a history entry.
  useEffect(() => {
    const id = setTimeout(() => {
      const next = new URLSearchParams();
      if (q.trim()) next.set("q", q.trim());
      if (verticals.length) next.set("v", verticals.join(","));
      if (tiers.length) next.set("t", tiers.join(","));
      if (country) next.set("c", country);
      if (maxPrice < 1500) next.set("max", String(maxPrice));
      if (sort !== "match") next.set("s", sort);

      const qs = next.toString();
      const url = qs ? `/marketplace?${qs}` : "/marketplace";
      if (url !== window.location.pathname + window.location.search) {
        router.replace(url, { scroll: false });
      }
    }, 250);
    return () => clearTimeout(id);
  }, [q, verticals, tiers, country, maxPrice, sort, router]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = CREATORS.filter((c) => {
      if (needle) {
        const hay = `${c.name} ${c.headline} ${c.bio} ${c.verticals.join(" ")}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (verticals.length && !verticals.includes(c.verticals[0])) return false;
      if (tiers.length && !tiers.includes(followerTier(c.followers))) return false;
      if (country && c.countryCode !== country) return false;
      if (c.postCost > maxPrice) return false;
      return true;
    });
    const by: Record<Sort, (a: typeof out[0], b: typeof out[0]) => number> = {
      match: (a, b) => b.matchScore - a.matchScore,
      "price-asc": (a, b) => a.postCost - b.postCost,
      "price-desc": (a, b) => b.postCost - a.postCost,
      reach: (a, b) => b.followers - a.followers,
    };
    return [...out].sort(by[sort]);
  }, [q, verticals, tiers, country, maxPrice, sort]);

  const selectedCreators = CREATORS.filter((c) => selected.includes(c.id));
  const basket = selectedCreators.reduce((s, c) => s + c.postCost, 0);
  const reach = selectedCreators.reduce((s, c) => s + c.medianViews, 0);

  const clearAll = () => {
    setQ(""); setVerticals([]); setTiers([]); setCountry(""); setMaxPrice(1500);
  };
  const filtersOn =
    !!q || verticals.length > 0 || tiers.length > 0 || !!country || maxPrice < 1500;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">Marketplace</h1>
          <p className="mt-1.5 text-sm text-muted">
            {results.length} creator{results.length === 1 ? "" : "s"} matching your filters
            {filtersOn && (
              <button onClick={clearAll} className="ml-2 font-semibold text-brand hover:underline">
                clear
              </button>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink outline-none focus:border-brand"
          >
            <option value="match">Best match</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
            <option value="reach">Reach</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* ------------------------------------------------------------ filters */}
        <aside className="space-y-7 lg:sticky lg:top-24 lg:self-start">
          <div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, topic, bio…"
              className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none placeholder:text-grey focus:border-brand"
            />
          </div>

          <FilterGroup label="Vertical">
            <div className="flex flex-wrap gap-1.5">
              {VERTICALS.map((v) => (
                <Chip key={v} on={verticals.includes(v)} onClick={() => toggle(verticals, setVerticals, v)}>
                  {v}
                </Chip>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Audience size">
            <div className="flex flex-wrap gap-1.5">
              {TIERS.map((t) => (
                <Chip key={t} on={tiers.includes(t)} onClick={() => toggle(tiers, setTiers, t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label={`Max price per post — ${euro(maxPrice)}`}>
            <input
              type="range"
              min={20}
              max={1500}
              step={20}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#1652f0]"
            />
            <div className="mt-1 flex justify-between text-[11px] text-grey">
              <span>€20</span>
              <span>€1,500</span>
            </div>
          </FilterGroup>

          <FilterGroup label="Country">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand"
            >
              <option value="">All countries</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </FilterGroup>
        </aside>

        {/* ------------------------------------------------------------- results */}
        <div>
          {results.length === 0 ? (
            <div className="nn-card grid place-items-center p-16 text-center">
              <p className="font-display font-bold text-ink">No creators match those filters</p>
              <p className="mt-1.5 text-sm text-muted">Try widening the price range or clearing a vertical.</p>
              <button
                onClick={clearAll}
                className="mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((c, i) => (
                <CreatorCard
                  key={c.id}
                  creator={c}
                  rank={i + 1}
                  selected={selected.includes(c.id)}
                  onSelect={(id) => toggle(selected, setSelected, id)}
                  favourite={favourites.includes(c.id)}
                  onFavourite={(id) => toggle(favourites, setFavourites, id)}
                  onBook={(id) => setSelected((s) => (s.includes(id) ? s : [...s, id]))}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- bulk bar */}
      {selected.length > 0 && (
        <div className="sticky bottom-5 z-40 mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-ink px-6 py-4 shadow-2xl">
          <div className="text-sm text-white">
            <span className="font-display font-bold">{selected.length}</span> creator
            {selected.length === 1 ? "" : "s"} selected
            <span className="mx-2 text-white/30">·</span>
            <span className="font-display font-bold">{euro(basket)}</span> total
            <span className="mx-2 text-white/30">·</span>
            <span className="text-white/70">~{(reach / 1000).toFixed(0)}K est. reach</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected([])}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white"
            >
              Clear
            </button>
            <Link
              href={`/app/campaigns/new?creators=${selected.join(",")}`}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-ink transition hover:bg-brand-soft"
            >
              Build campaign brief →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="nn-eyebrow mb-2.5">{label}</div>
      {children}
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cx(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        on
          ? "border-brand bg-brand text-white"
          : "border-line bg-white text-muted hover:border-grey hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
