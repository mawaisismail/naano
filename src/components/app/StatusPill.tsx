import { cx } from "@/lib/format";

const STYLES: Record<string, string> = {
  invited: "bg-surface text-muted border-line",
  accepted: "bg-brand-soft text-brand border-brand/20",
  declined: "bg-red-50 text-red-600 border-red-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  scheduled: "bg-violet-50 text-violet-700 border-violet-200",
  live: "bg-green-50 text-success border-green-200",
  paid: "bg-ink text-white border-ink",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        STYLES[status] ?? STYLES.invited
      )}
    >
      {status === "live" && (
        <span className="size-1.5 animate-pulse rounded-full bg-success" />
      )}
      {status}
    </span>
  );
}
