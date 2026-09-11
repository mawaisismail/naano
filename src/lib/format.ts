export const compact = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
    : n >= 1000
      ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`
      : `${n}`;

export const euro = (n: number) =>
  `€${n.toLocaleString("en-IE", { maximumFractionDigits: 0 })}`;

export const cx = (...p: (string | false | null | undefined)[]) =>
  p.filter(Boolean).join(" ");
