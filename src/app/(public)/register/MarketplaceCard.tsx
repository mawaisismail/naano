"use client";

/**
 * The live marketplace-card preview on the creator sign-up page.
 *
 * Authored from naano's own card at 1440. It fills in as the form is typed —
 * the initial in the avatar, the name, and nothing else, because everything
 * below the name genuinely is unknown until LinkedIn is imported at step 2.
 * Their card shows em-dashes and "Pending" there, and so does this one.
 *
 *   card     radius 34 (42 at sm), 1px #E4E5E7, white/90, backdrop-blur
 *            shadow 0 20 55 rgba(15,23,42,.10), 0 2 8 rgba(15,23,42,.05)
 *   banner   aspect 4/1, linear-gradient(135deg,#0C3EBE,#1959EF 57%,#6691FF)
 *            over two radial highlights, logo centred at min(32%,112px)
 *   badge    44 square, radius 15, white/88 + 1px white/75, inner 28 #0A66C2
 *   avatar   78 circle, 3px #2563EB ring, #F7F6F3 face, 28px/600 initial
 *   name     24 → 28, -0.035em, #111827
 *   headline 14 → 15 / 24 / #5F6673, two-line clamp, min-height 48
 *   data row max-w 360, 1.5px track #E8EBF1, gradient #2563EB → #7C8DF6
 *   stats    3 cells on #FCFCFD above a #E7E8EB rule, 20 → 24 figures
 */
export function MarketplaceCard({
  name,
  headline = null,
  avatarUrl = null,
  followers = null,
  postCost = null,
  industries = [],
  flag = null,
}: {
  name: string;
  /** Everything below is null until step 2 imports it. */
  headline?: string | null;
  avatarUrl?: string | null;
  followers?: number | null;
  postCost?: number | null;
  industries?: string[];
  flag?: string | null;
}) {
  const trimmed = name.trim();
  const initial = (trimmed[0] ?? "Y").toUpperCase();
  const compact = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K` : String(n);

  return (
    <div className="relative w-full max-w-[500px]" aria-live="polite">
      <section
        aria-label={`Preview of ${trimmed || "your"} Marketplace card`}
        className="group/card relative w-full"
      >
        <div className="relative overflow-hidden rounded-[34px] border border-[#E4E5E7] bg-white/90 shadow-[0_20px_55px_rgba(15,23,42,0.10),0_2px_8px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-[#9FB9F7] hover:shadow-[0_30px_72px_rgba(37,62,117,0.18),0_8px_22px_rgba(49,91,194,0.09)] sm:rounded-[42px]">
          {/* ------------------------------------------------------ banner */}
          <div className="relative aspect-[4/1] px-5 py-4 sm:px-7 sm:py-5">
            <div
              aria-hidden
              className="absolute inset-0 grid place-items-center overflow-hidden"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 12% 8%, rgba(255,255,255,0.25), transparent 28%), radial-gradient(circle at 88% 86%, rgba(137,174,255,0.42), transparent 36%), linear-gradient(135deg, #0C3EBE 0%, #1959EF 57%, #6691FF 100%)",
              }}
            >
              <span className="absolute -right-16 -top-20 size-32 rounded-full border border-white/15 shadow-[0_0_0_20px_rgba(255,255,255,0.045),0_0_0_40px_rgba(255,255,255,0.025)]" />
              <span className="absolute -bottom-12 -left-12 size-20 rounded-full border border-white/15 shadow-[0_0_0_16px_rgba(255,255,255,0.035)]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/lp/naano-logo-nav.png"
                alt=""
                className="relative z-10 mb-3 max-h-7 w-[min(32%,112px)] object-contain brightness-0 invert sm:mb-3.5 sm:max-h-8"
              />
            </div>

            <span
              title="Open my LinkedIn profile"
              className="absolute left-5 top-4 z-20 inline-flex size-11 items-center justify-center rounded-[15px] border border-white/75 bg-white/[0.88] opacity-90 shadow-[0_6px_18px_rgba(15,23,42,0.10)] backdrop-blur-md sm:left-7 sm:top-5"
            >
              <span aria-hidden className="inline-flex size-7 items-center justify-center rounded-[8px] bg-[#0A66C2] text-white shadow-[0_4px_10px_rgba(10,102,194,0.24)]">
                <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
                  <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0ZM.24 8.25h4.5V24h-4.5V8.25Zm7.5 0h4.31v2.15h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9V24h-4.5v-7.9c0-1.88-.03-4.3-2.62-4.3-2.62 0-3.02 2.05-3.02 4.16V24h-4.5V8.25Z" />
                </svg>
              </span>
            </span>

            {flag ? (
              <span className="absolute right-5 top-4 z-20 inline-flex size-11 items-center justify-center rounded-[15px] border border-white/75 bg-white/[0.88] text-[20px] shadow-[0_6px_18px_rgba(15,23,42,0.10)] backdrop-blur-md sm:right-7 sm:top-5">
                {flag}
              </span>
            ) : null}

            <div className="absolute bottom-0 left-1/2 z-30 -translate-x-1/2 translate-y-1/2">
              <div className="relative rounded-full shadow-[0_10px_24px_rgba(37,99,235,0.20)] ring-[3px] ring-[#2563EB]">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="size-[78px] shrink-0 rounded-full bg-[#F7F6F3] object-cover" />
                ) : (
                  <div className="flex size-[78px] shrink-0 items-center justify-center rounded-full bg-[#F7F6F3] text-[28px] font-semibold text-[#787774]">
                    {initial}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------- body */}
          <div className="px-5 pb-0 pt-[54px] text-center sm:px-8 sm:pt-[58px]">
            <div className="flex min-w-0 justify-center px-8">
              <div className="relative min-w-0 max-w-full">
                <h2 className="truncate text-[24px] font-bold leading-tight tracking-[-0.035em] text-[#111827] sm:text-[28px]">
                  {trimmed || "Your name"}
                </h2>
              </div>
            </div>

            {industries.length ? (
              <p className="mt-1 text-[15px] text-[#5F6673]">{industries.join(" · ")}</p>
            ) : null}

            <p
              className="mx-auto mt-5 min-h-[48px] max-w-[390px] text-[14px] leading-6 text-[#5F6673] sm:text-[15px]"
              style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
            >
              {headline || "Your LinkedIn headline and topics will appear here."}
            </p>

            <div className="mx-auto mt-4 flex max-w-[360px] items-center gap-3 pb-5 text-left">
              <span className="shrink-0 text-xs font-medium text-[#8A909B]">Data</span>
              <span
                role="progressbar"
                aria-label="Measured post coverage"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={0}
                className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#E8EBF1]"
              >
                <span
                  className="block h-full rounded-full bg-[linear-gradient(90deg,#2563EB,#7C8DF6)] transition-[width] duration-300"
                  style={{ width: "0%" }}
                />
              </span>
              <span className="shrink-0 text-xs font-semibold text-[#6B7280]">Pending</span>
            </div>
          </div>

          {/* ------------------------------------------------------- stats */}
          <dl className="grid grid-cols-3 border-t border-[#E7E8EB] bg-[#FCFCFD]">
            <Stat label="Followers" value={followers ? compact(followers) : null} />
            <Stat label="Est. impressions" divided />
            <Stat
              label={postCost ? "Potential cost" : "Cost / post"}
              value={postCost ? `€${postCost}` : null}
            />
          </dl>

          {/* naano lays a faint noise field over the whole card; it is what
              stops the large flat gradient from banding on a wide monitor. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.14] mix-blend-soft-light"
            style={{
              backgroundSize: "170px 170px",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.62'/%3E%3C/svg%3E\")",
            }}
          />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, divided, value }: { label: string; divided?: boolean; value?: string | null }) {
  return (
    <div
      className={`flex min-w-0 flex-col items-center justify-center px-2 py-5 text-center sm:px-4 sm:py-6 ${
        divided ? "border-x border-[#E7E8EB]" : ""
      }`}
    >
      <dt className="order-2 mt-1 text-[11px] leading-4 text-[#8A909B] sm:text-xs">{label}</dt>
      <dd className="order-1 w-full truncate text-[20px] font-bold tracking-[-0.025em] text-[#111827] sm:text-[24px]">
        {value ?? "—"}
      </dd>
    </div>
  );
}
