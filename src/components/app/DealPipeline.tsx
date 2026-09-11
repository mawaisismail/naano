import { STAGES, STAGE_LABEL, stageIndex } from "@/lib/lifecycle";
import { cx } from "@/lib/format";

/** Horizontal stage tracker: where this booking sits in the lifecycle. */
export function DealPipeline({ status }: { status: string }) {
  if (status === "declined") {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-red-600">
        <span className="size-1.5 rounded-full bg-red-500" />
        Declined by creator
      </div>
    );
  }

  const at = stageIndex(status);

  return (
    <ol className="flex items-center gap-1" aria-label="Deal stage">
      {STAGES.map((s, i) => {
        const done = i < at;
        const here = i === at;
        return (
          <li key={s} className="flex items-center gap-1">
            <span
              title={STAGE_LABEL[s]}
              className={cx(
                "h-1.5 rounded-full transition-all",
                here ? "w-6 bg-brand" : done ? "w-3 bg-brand/45" : "w-3 bg-line"
              )}
            />
          </li>
        );
      })}
      <li className="ml-2 text-[11px] font-semibold text-muted">
        {STAGE_LABEL[status]}
      </li>
    </ol>
  );
}
