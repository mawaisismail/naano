"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cx } from "@/lib/format";

type Stats = { total: number; byDeal: Record<string, number> };

const Ctx = createContext<Stats | null>(null);

/**
 * Polls /api/stats and shares the result with every counter on the page, so a
 * campaign with twenty deals still makes one request per tick rather than
 * twenty. Seeded with server-rendered values, so the numbers are correct on
 * first paint and only *updates* depend on the poll.
 */
export function LiveStatsProvider({
  initial,
  intervalMs = 2000,
  children,
}: {
  initial: Stats;
  intervalMs?: number;
  children: React.ReactNode;
}) {
  const [stats, setStats] = useState<Stats>(initial);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (res.ok && alive) setStats(await res.json());
      } catch {
        // a failed poll is not worth surfacing; the next tick retries
      }
      if (alive) timer = setTimeout(tick, intervalMs);
    };

    timer = setTimeout(tick, intervalMs);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [intervalMs]);

  return <Ctx.Provider value={stats}>{children}</Ctx.Provider>;
}

/** A single click count that flashes when it goes up. */
export function LiveCount({
  dealId,
  initial,
  className,
}: {
  dealId?: string;
  initial: number;
  className?: string;
}) {
  const stats = useContext(Ctx);
  const value = stats
    ? dealId
      ? (stats.byDeal[dealId] ?? initial)
      : stats.total
    : initial;

  const prev = useRef(value);
  const [bumped, setBumped] = useState(false);

  useEffect(() => {
    if (value > prev.current) {
      setBumped(true);
      const t = setTimeout(() => setBumped(false), 900);
      prev.current = value;
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value]);

  return (
    <span
      className={cx(
        "inline-block tabular-nums transition-all duration-300",
        bumped && "scale-110 text-success",
        className
      )}
    >
      {value.toLocaleString("en-IE")}
    </span>
  );
}

/**
 * Sum of a specific set of deals. /api/stats returns every deal for the brand,
 * so a campaign page must sum its own deals rather than use the global total.
 */
export function LiveSum({
  dealIds,
  initial,
  className,
}: {
  dealIds: string[];
  initial: number;
  className?: string;
}) {
  const stats = useContext(Ctx);
  const value = stats
    ? dealIds.reduce((sum, id) => sum + (stats.byDeal[id] ?? 0), 0)
    : initial;

  const prev = useRef(value);
  const [bumped, setBumped] = useState(false);

  useEffect(() => {
    if (value > prev.current) {
      setBumped(true);
      const t = setTimeout(() => setBumped(false), 900);
      prev.current = value;
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value]);

  return (
    <span
      className={cx(
        "inline-block tabular-nums transition-all duration-300",
        bumped && "scale-110 text-success",
        className
      )}
    >
      {value.toLocaleString("en-IE")}
    </span>
  );
}

/** Small "counting live" affordance so the demo reads on camera. */
export function LivePulse({ label = "live" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-success">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-70" />
        <span className="relative inline-flex size-1.5 rounded-full bg-success" />
      </span>
      {label}
    </span>
  );
}
