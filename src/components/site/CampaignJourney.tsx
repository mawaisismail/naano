/**
 * "Run creator campaigns from one place." — naano's 01-05 row.
 *
 * Authored from their stylesheet rather than approximated:
 *   .lp-journey        padding 110px 84px 126px, linear-gradient(#f2faff, #fff 27%)
 *   .lp-journey__inner width min(100%, 1320px)
 *   .lp-journey__header grid minmax(0,720px) / minmax(280px,420px), align end, gap 60
 *   .lp-journey__path  grid repeat(5, 1fr), gap 16, min-height 350, mt 62, py 34/38
 *   step card          251x351, white 74%, radius 24, 1px white-92% border, pad 18/18/22
 *   inner mock         213x247, white 56%, radius 20, 1px white-90% border
 *   title              17px / 650 / 22.1px
 *   accent             #315b7c — their bars and status text are navy, not brand blue
 */

const NAVY = "#315b7c";

const STEPS = [
  { n: "01", title: "Find creators your buyers trust", mock: <MockMatch />, panel: false },
  { n: "02", title: "Build a campaign brief in minutes", mock: <MockBrief />, panel: true },
  { n: "03", title: "Manage every collaboration", mock: <MockManage />, panel: true },
  { n: "04", title: "Track reach, clicks, and leads", mock: <MockTrack />, panel: true },
  { n: "05", title: "Pay creators without the admin", mock: <MockPay />, panel: true },
];

/** 02-05 sit their mock on a white card inside the well; 01 is bare tiles. */
const MOCK_PANEL =
  "w-full max-w-[272px] rounded-[16px] border border-[rgba(203,224,238,0.72)] " +
  "bg-white/90 p-[18px] shadow-[0_20px_48px_-32px_rgba(56,96,128,0.32)]";

export function CampaignJourney() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-20 overflow-hidden px-5 pb-[72px] pt-[64px] lg:px-[84px] lg:pb-[126px] lg:pt-[110px]"
      style={{ background: "linear-gradient(#f2faff 0%, #ffffff 27%, #ffffff 100%)" }}
    >
      {/* .lp-system-platform::before — a 290px cloud band hung above the top
          edge at 11%, which is what softens the seam from the marketplace. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-[-100.3px] right-[-100.3px] top-[-90px] z-0 h-[290px] bg-[url('/lp/book-clouds.jpg')] bg-cover bg-[50%_76%] opacity-[0.11]"
      />

      <div className="relative z-[2] mx-auto w-full max-w-[1320px]">
        {/* Their header is a two-row grid — the eyebrow sits on its own row
            above the heading, with the same 60px gap between rows. */}
        <div className="grid items-end gap-[60px] max-lg:grid-cols-1 lg:[grid-template-columns:minmax(0,720px)_minmax(280px,420px)]">
          <div className="flex items-center gap-2.5 text-[12px] font-[750] uppercase leading-[15px] tracking-[1.8px] text-[#60727c] lg:col-start-1 lg:row-start-1">
            <span className="size-[8px] rounded-full bg-[#92cbe5] shadow-[0_0_0_5px_rgba(146,203,229,0.16)]" />
            One platform, from brief to results
          </div>
          <h2 className="mt-[18px] text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#111318] lg:col-start-1 lg:row-start-2 nn-h2">
            Run creator campaigns
            <br />
            from one place.
          </h2>
          <p className="mb-[3px] mt-5 max-w-[400px] text-[16px] leading-[1.5] text-[#55575e] lg:col-start-2 lg:row-start-2 lg:text-[19px] lg:leading-[28.5px]">
            Find the right voices, launch faster, and connect every post to
            measurable business results.
          </p>
        </div>

        <div className="relative mt-[62px] grid min-h-[350px] grid-cols-1 items-stretch gap-4 py-[34px] pb-[38px] lg:grid-cols-5 lg:grid-rows-[351.188px]">
          {/* .lp-journey__current — a wide soft cloud behind the row at 36%,
              which is what gives the panel its tint as well as the cloud base */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lp/journey-cloud-current.jpg"
            alt=""
            aria-hidden
            /* naano hangs this 66px to the left of the grid and reads the
               frame at 50% 58%, which is what puts cloud under the cards
               rather than a flat band across them. The section clips it, so
               it can bleed past the grid without causing page overflow. */
            className="pointer-events-none absolute bottom-[-20px] left-0 z-0 h-[485px] w-full select-none object-cover lg:left-[-66px]"
            style={{ opacity: 0.36, objectPosition: "50% 58%" }}
          />

          {/* .lp-journey__route — not a straight rule: a curve that threads all
              five steps, dashes flowing along it. Their exact path and stroke. */}
          <svg
            aria-hidden
            viewBox="0 0 1280 360"
            fill="none"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-y-0 left-[-8px] z-[1] hidden h-full w-[calc(100%+16px)] overflow-visible lg:block"
          >
            <path
              d="M34 186 C172 132 280 230 410 182 S646 142 770 188 S1026 226 1246 174"
              stroke="#509dc2b8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="8 11"
              className="nn-route-flow"
            />
          </svg>

          {STEPS.map((s) => (
            <div
              key={s.n}
              className="relative z-[2] flex flex-col rounded-[24px] border border-white/[0.92] bg-white/[0.74] px-[18px] pb-[22px] pt-[18px] shadow-[0_22px_58px_-44px_rgba(56,96,128,0.38)] backdrop-blur-[14px] transition-[transform,box-shadow] duration-[440ms] [transition-timing-function:cubic-bezier(.16,1,.3,1)] hover:-translate-y-1 hover:shadow-[0_18px_44px_-24px_rgba(48,87,108,0.4)]"
            >
              <span
                className="absolute -top-[14px] left-[18px] z-[4] grid h-[28px] w-[36px] place-items-center rounded-full border border-[rgba(143,187,209,0.4)] bg-[#f4fbfe] text-[10px] font-extrabold leading-none tracking-[0.8px] text-[#54778a]"
              >
                {s.n}
              </span>

              {/* the well: flex-1 so it takes whatever the fixed row leaves */}
              <div className="flex min-h-[158px] flex-1 items-center justify-center overflow-hidden rounded-[20px] border border-white/90 bg-white/[0.56] px-4 py-[18px]">
                {s.panel ? <div className={MOCK_PANEL}>{s.mock}</div> : s.mock}
              </div>

              <h3 className="mx-1 mt-[18px] text-[17px] font-[650] leading-[22.1px] tracking-[-0.34px] text-[#111318]">
                {s.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ mocks */

/** 01 — three creators as portrait tiles with a fit score. */
function MockMatch() {
  const people = [
    { file: "b", name: "Eric", fit: 92 },
    { file: "h", name: "Robin", fit: 88 },
    { file: "f", name: "Aya", fit: 84 },
  ];
  return (
    <div className="flex gap-1.5">
      {people.map((p) => (
        <div key={p.name} className="min-w-0 flex-1 rounded-[10px] border border-line/60 bg-white p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/lp/avatar-${p.file}.png`}
            alt=""
            className="h-[52px] w-full rounded-[7px] object-cover"
          />
          <div className="mt-1.5 truncate text-[10px] font-bold text-ink">{p.name}</div>
          <div className="flex items-baseline gap-1 text-[9px] text-grey">
            Fit
            <span className="font-bold" style={{ color: NAVY }}>
              {p.fit}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** 02 — the drafted brief with its AI chip. */
function MockBrief() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-ink">Campaign brief</span>
        <span
          className="rounded-full px-2 py-0.5 text-[9px] font-bold"
          style={{ background: "#e7f1f8", color: NAVY }}
        >
          AI
        </span>
      </div>
      <ul className="mt-3 space-y-2.5">
        {["Objectives and key messages", "Creator guidelines", "Tracking links ready"].map((t) => (
          <li key={t} className="flex items-start gap-2 text-[10px] leading-tight text-[#55575e]">
            <span
              className="mt-px grid size-[13px] shrink-0 place-items-center rounded-full text-[8px] font-bold text-white"
              style={{ background: NAVY }}
            >
              ✓
            </span>
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-4 h-[6px] overflow-hidden rounded-full bg-[#e7eef4]">
        <div className="h-full w-[72%] rounded-full" style={{ background: NAVY }} />
      </div>
    </div>
  );
}

/** 03 — the same three creators moving through the lifecycle. */
function MockManage() {
  const rows = [
    { file: "d", name: "Raphael", state: "Draft ready" },
    { file: "b", name: "Thomas", state: "Scheduled" },
    { file: "e", name: "Nada", state: "Live" },
  ];
  return (
    <div>
      {rows.map((r) => (
        <div key={r.name} className="flex items-center gap-2.5 pb-[11px] last:pb-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/lp/avatar-${r.file}.png`} alt="" className="size-[30px] shrink-0 rounded-full object-cover" />
          {/* naano sizes the name to its content and lets the status chip wrap
              to two lines — 30 + 10 + 45.2 + 10 + 46 fills their 141.2 row. */}
          <span className="shrink-0 text-[11.5px] font-bold leading-[14px] text-[#17181c]">
            {r.name}
          </span>
          <span
            className="ml-auto w-[46px] shrink-0 rounded-[8px] px-1.5 py-1 text-center text-[9.5px] font-bold leading-[1.3]"
            style={{ background: "#e7f1f8", color: NAVY }}
          >
            {r.state}
          </span>
        </div>
      ))}
    </div>
  );
}

/** 04 — attributed pipeline. */
function MockTrack() {
  const bars = [26, 34, 30, 46, 40, 74, 92];
  return (
    <div>
      <div className="text-[9.5px] font-medium text-[#8a949c]">Attributed pipeline</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-[21px] font-extrabold tracking-tight text-ink">€48.2K</span>
        <span
          className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
          style={{ background: "#e7f1f8", color: NAVY }}
        >
          +24%
        </span>
      </div>
      <div className="mt-3 flex h-[54px] items-end gap-[5px]">
        {bars.map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-[3px]"
            style={{ height: `${h}%`, background: i >= bars.length - 2 ? NAVY : "#d5e3ee" }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[9.5px] text-[#8a949c]">
        <span>124K views</span>
        <span>418 leads</span>
      </div>
    </div>
  );
}

/** 05 — payout, handled by Naano. */
function MockPay() {
  return (
    <div>
      <div className="flex items-start gap-2">
        <span
          className="mt-px grid size-[15px] shrink-0 place-items-center rounded-full text-[9px] font-bold text-white"
          style={{ background: NAVY }}
        >
          ✓
        </span>
        <div>
          <div className="text-[11px] font-bold leading-tight text-ink">Payment scheduled</div>
          <div className="mt-0.5 text-[9.5px] text-[#8a949c]">Handled by Naano</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-[10px] border border-line/60 bg-white px-2.5 py-2">
        <span className="text-[9.5px] leading-tight text-[#8a949c]">
          Creator
          <br />
          payout
        </span>
        <span className="text-[13px] font-extrabold text-ink">€1,240</span>
      </div>
      <div className="mt-3 flex gap-1.5">
        {["Contract", "Invoice", "Payout"].map((t) => (
          <span key={t} className="rounded-[6px] bg-[#eef2f5] px-1.5 py-1 text-[8.5px] font-semibold text-[#8a949c]">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
