"use client";

import { useMemo, useState } from "react";
import { FileText, Globe, Search } from "lucide-react";
import { SORTS, type Sort } from "@/lib/opportunities";
import { ApplyButton } from "./ApplyButton";

/**
 * The creator-side Opportunities board, authored from naano's screen.
 *
 *   h1       40 / 700 -0.02em, lead 15 / 26 #6B7280
 *   channels pill row — the active one solid #2563eb, each carrying a count
 *   filters  search field spanning the row, then industry, country and sort
 *   card     cloud banner with a channel chip and a match chip, a centred
 *            brand tile, name, "Main campaign", a region pill, an audience
 *            relevance bar, a three-cell stat strip, then brief and Apply
 *
 * Filtering runs in the browser over the rows the server already sent: the
 * board is a few dozen campaigns, so a round trip per keystroke would be
 * slower and no more correct.
 */

export type Opportunity = {
  id: string;
  brand: string;
  name: string;
  objective: string;
  channel: string;
  industries: string[];
  countries: string[];
  days: number | null;
  match: number;
  applied: boolean;
};

/** lucide v1 dropped its brand icons, so the LinkedIn mark is inlined — the
 *  same path already used on the sign-up buttons and the marketplace card. */
function LinkedInMark({ className = "size-[15px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} text-[#0A66C2]`} fill="currentColor" aria-hidden>
      <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0ZM.24 8.25h4.5V24h-4.5V8.25Zm7.5 0h4.31v2.15h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9V24h-4.5v-7.9c0-1.88-.03-4.3-2.62-4.3-2.62 0-3.02 2.05-3.02 4.16V24h-4.5V8.25Z" />
    </svg>
  );
}

const CHIP = "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors";
const SELECT =
  "rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563eb]";

export function OpportunityBoard({ items }: { items: Opportunity[] }) {
  const [channel, setChannel] = useState<"all" | string>("all");
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All industries");
  const [country, setCountry] = useState("All countries");
  const [sort, setSort] = useState<Sort>(SORTS[0]);

  const industries = useMemo(
    () => ["All industries", ...new Set(items.flatMap((i) => i.industries))].sort((a, b) => (a === "All industries" ? -1 : b === "All industries" ? 1 : a.localeCompare(b))),
    [items]
  );
  const countries = useMemo(
    () => ["All countries", ...new Set(items.flatMap((i) => i.countries))].sort((a, b) => (a === "All countries" ? -1 : b === "All countries" ? 1 : a.localeCompare(b))),
    [items]
  );
  const channels = useMemo(() => [...new Set(items.map((i) => i.channel))], [items]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((i) => {
      if (channel !== "all" && i.channel !== channel) return false;
      if (industry !== "All industries" && !i.industries.includes(industry)) return false;
      // A campaign with no country list is open everywhere, so it survives a
      // country filter rather than disappearing from it.
      if (country !== "All countries" && i.countries.length > 0 && !i.countries.includes(country)) {
        return false;
      }
      if (q && !`${i.brand} ${i.name} ${i.objective}`.toLowerCase().includes(q)) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sort === "Deadline") {
        return (a.days ?? Infinity) - (b.days ?? Infinity);
      }
      if (sort === "Newest") return 0; // the server already sent them newest first
      return b.match - a.match;
    });
  }, [items, channel, industry, country, query, sort]);

  const countFor = (c: "all" | string) =>
    c === "all" ? items.length : items.filter((i) => i.channel === c).length;

  return (
    <div className="mx-auto max-w-[1340px] pt-2">
      <h1 className="text-[40px] font-bold tracking-[-0.02em] text-[#111827]">Opportunities</h1>
      <p className="mt-2 text-[15px] leading-[26px] text-[#6B7280]">
        Open brand campaigns - apply, the brand accepts, and the booking is
        created on your terms.
      </p>

      {/* --------------------------------------------------------- channels */}
      <div className="mt-6 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => setChannel("all")}
          aria-pressed={channel === "all"}
          className={`${CHIP} ${channel === "all" ? "bg-[#2563eb] text-white" : "border border-[#E5E7EB] bg-white text-[#374151]"}`}
        >
          All channels <span className="opacity-70">{countFor("all")}</span>
        </button>
        {channels.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChannel(c)}
            aria-pressed={channel === c}
            className={`${CHIP} inline-flex items-center gap-2 ${
              channel === c ? "bg-[#2563eb] text-white" : "border border-[#E5E7EB] bg-white text-[#374151]"
            }`}
          >
            <LinkedInMark />
            <span className="capitalize">{c === "linkedin" ? "LinkedIn" : c}</span>
            <span className="opacity-70">{countFor(c)}</span>
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------------- filters */}
      <div className="mt-5 flex flex-wrap gap-3">
        <div className="relative min-w-[280px] flex-1">
          <Search size={18} strokeWidth={1.8} aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a campaign or a brand..."
            aria-label="Search for a campaign or a brand"
            className="w-full rounded-[12px] border border-[#E5E7EB] bg-white py-3 pl-11 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>
        <select aria-label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={SELECT}>
          {industries.map((i) => <option key={i}>{i}</option>)}
        </select>
        <select aria-label="Country" value={country} onChange={(e) => setCountry(e.target.value)} className={SELECT}>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={SELECT}>
          {SORTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* ------------------------------------------------------------ cards */}
      {shown.length === 0 ? (
        <p className="py-24 text-center text-sm text-[#6B7280]">
          No campaigns match these filters.
        </p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((o) => (
            <Card key={o.id} o={o} />
          ))}
        </div>
      )}
    </div>
  );
}

function Card({ o }: { o: Opportunity }) {
  return (
    <article className="overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white">
      <div
        className="relative h-[104px]"
        style={{
          backgroundImage: "url('/lp/hero-clouds.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 60%",
        }}
      >
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-semibold text-[#111827] shadow-sm backdrop-blur">
          <LinkedInMark className="size-[13px]" />
          LinkedIn
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-semibold text-[#111827] shadow-sm backdrop-blur">
          <span className="size-1.5 rounded-full bg-[#2563eb]" />
          {o.match}% match
        </span>

        <span className="absolute -bottom-7 left-1/2 grid size-[58px] -translate-x-1/2 place-items-center rounded-[14px] border border-[#EDEFF3] bg-white text-lg font-bold uppercase text-[#111827] shadow-sm">
          {o.brand.slice(0, 2)}
        </span>
      </div>

      <div className="px-5 pb-5 pt-10 text-center">
        <h2 className="text-[17px] font-bold text-[#111827]">{o.brand}</h2>
        {/* naano's cards all read "Main campaign" because each brand runs one.
            A brand with several open at once needs them told apart, so the
            campaign name is shown whenever it differs from the brand name. */}
        <p className="mt-0.5 text-sm text-[#6B7280]">
          {o.name === o.brand ? "Main campaign" : o.name}
        </p>

        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] px-3 py-1 text-[12px] font-semibold text-[#4B5563]">
          <Globe size={13} strokeWidth={1.8} aria-hidden />
          {o.countries.length ? o.countries.slice(0, 2).join(" · ") : "Open worldwide"}
        </span>

        <div className="mt-4 rounded-[12px] border border-[#EEF0F4] px-4 py-3 text-left">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] text-[#6B7280]">Audience relevance</span>
            <span className="text-[13px] font-bold text-[#2563eb]">{o.match}/100</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EEF1F6]">
            <div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${o.match}%` }} />
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-3 rounded-[12px] border border-[#EEF0F4]">
          <Cell value={`${o.match}/100`} label="Match" />
          <Cell value="LinkedIn" label="Channel" divided />
          <Cell value={o.days === null ? "—" : `${o.days} days`} label="Post deadline" />
        </dl>

        <div className="mt-4 flex gap-2.5">
          <a
            href={`/creator/opportunities#${o.id}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-[12px] border border-[#E5E7EB] px-3 py-3 text-sm font-semibold text-[#111827] transition-colors hover:border-[#9CA3AF]"
          >
            <FileText size={16} strokeWidth={1.8} aria-hidden />
            View the brief
          </a>
          <ApplyButton campaignId={o.id} applied={o.applied} />
        </div>
      </div>
    </article>
  );
}

function Cell({ value, label, divided }: { value: string; label: string; divided?: boolean }) {
  return (
    <div className={`px-2 py-3 ${divided ? "border-x border-[#EEF0F4]" : ""}`}>
      <dd className="text-[13px] font-bold text-[#111827]">{value}</dd>
      <dt className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
        {label}
      </dt>
    </div>
  );
}
