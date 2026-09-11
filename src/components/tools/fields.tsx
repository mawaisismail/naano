"use client";

/**
 * Form primitives for the free tools, matched to naano's:
 *   label  14 / 600 / #17181C, optional 12 / 400 / #6B6D74 hint below
 *   input  min-h 44, radius 12, 1px #E4E1DC, px 16 py 12, 15px,
 *          placeholder #B4B4B0, focus ring 2 #1652F0
 *   empty  dashed 1px #E4E1DC on #FAFAF9, radius 14, px 20 py 24, 15/24.375
 */

const INPUT =
  "mt-2 min-h-11 w-full rounded-[14px] border border-[#E4E1DC] bg-white px-4 py-3 text-[15px] text-[#17181C] shadow-[0_1px_2px_rgba(23,24,28,0.03)] placeholder:text-[#B4B4B0] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1652F0]";

export function NumberField({
  id,
  label,
  hint,
  placeholder,
  value,
  onChange,
  wide,
  prefix,
}: {
  id: string;
  label: string;
  hint?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  wide?: boolean;
  prefix?: string;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="block text-sm font-semibold text-[#17181C]">
        {label}
        {hint ? <span className="block text-xs font-normal text-[#6B6D74]">{hint}</span> : null}
      </label>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute bottom-0 left-4 top-2 flex items-center text-[15px] text-[#6B6D74]">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={prefix ? `${INPUT} pl-8` : INPUT}
        />
      </div>
    </div>
  );
}

export function SelectField({
  id,
  label,
  hint,
  value,
  onChange,
  options,
  wide,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="block text-sm font-semibold text-[#17181C]">
        {label}
        {hint ? <span className="block text-xs font-normal text-[#6B6D74]">{hint}</span> : null}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TextField({
  id,
  label,
  hint,
  placeholder,
  value,
  onChange,
  rows,
}: {
  id: string;
  label: string;
  hint?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="sm:col-span-2">
      <label htmlFor={id} className="block text-sm font-semibold text-[#17181C]">
        {label}
        {hint ? <span className="block text-xs font-normal text-[#6B6D74]">{hint}</span> : null}
      </label>
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT}
        />
      ) : (
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT}
        />
      )}
    </div>
  );
}

/** naano's empty state: the result panel before anything has been typed. */
export function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-dashed border-[#E4E1DC] bg-[#FAFAF9] px-5 py-6 text-[15px] leading-[1.625] text-[#55575E]">
      {children}
    </div>
  );
}

export function ResultGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-3">{children}</div>;
}

export function Metric({
  label,
  value,
  note,
  tone = "ink",
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "ink" | "brand";
}) {
  return (
    <div className="rounded-[14px] border border-[#ECEAE6] bg-[#FAFAF9] px-5 py-4">
      <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6B6D74]">
        {label}
      </div>
      <div
        className={`mt-1 text-[26px] font-semibold tracking-[-0.02em] ${
          tone === "brand" ? "text-[#1652F0]" : "text-[#17181C]"
        }`}
      >
        {value}
      </div>
      {note ? <div className="mt-1 text-[13px] leading-[1.5] text-[#6B6D74]">{note}</div> : null}
    </div>
  );
}

export function Verdict({ tone, children }: { tone: "good" | "ok" | "low"; children: React.ReactNode }) {
  const map = {
    good: "border-[#BBE7CE] bg-[#F1FBF5] text-[#146C3A]",
    ok: "border-[#CBDCF9] bg-[#F2F6FE] text-[#1240D0]",
    low: "border-[#F2DCC0] bg-[#FDF7EF] text-[#8A5A11]",
  } as const;
  return (
    <div className={`mt-4 rounded-[14px] border px-5 py-4 text-[15px] leading-[1.6] ${map[tone]}`}>
      {children}
    </div>
  );
}
