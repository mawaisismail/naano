import { CREATORS } from "@/lib/creators";
import { CreatorCard } from "@/components/CreatorCard";

const CLAIMS = [
  {
    title: "3,000+ vetted creators",
    body: "Specialist B2B voices, ready to collaborate.",
  },
  {
    title: "Across 100 countries",
    body: "Local expertise with genuinely global reach.",
  },
  {
    title: "Matched to your buyers",
    body: "Audience fit comes before follower count.",
  },
] as const;

/** naano shows these seven, in two rows of four and three. */
const FLAGS = ["🇫🇷", "🇺🇸", "🇩🇪", "🇬🇧", "🇪🇸", "🇨🇦", "🇳🇱"];

const ICP_PILLS = ["Founders", "Sales leaders", "GTM teams"];

const RAIL = ["grid", "store", "hands", "layers", "chat", "card"] as const;

const RAIL_PATHS: Record<string, string> = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  store: "M3 9l1.5-5h15L21 9M3 9h18M3 9v11h18V9M9 20v-6h6v6",
  hands: "M4 12l4-4 4 4-4 4zM12 12l4-4 4 4-4 4",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  chat: "M21 12a8 8 0 01-8 8H7l-4 3V12a8 8 0 018-8h2a8 8 0 018 8z",
  card: "M2 7h20v11H2zM2 11h20",
};

/**
 * "Work with all the best creators." — naano's section after the testimonial.
 *
 * Authored values from their page at 1672: eyebrow pill 13px/650 on white at
 * 68%, h2 76px / 75.24px line-height / weight 600 / letter-spacing -3.952px,
 * subhead 21px / 31.92px capped at 650.
 *
 * naano renders the app preview as a flat screenshot,
 * marketplace-screenshot-clean-v2.png. That file carries photographs of real,
 * named creators, so it is not reproduced here. The preview below is live DOM
 * built from this project's own invented creators and generated avatars — same
 * composition, nobody's likeness republished, and it stays in sync with the
 * real card component rather than going stale as an image.
 */
export function MarketplaceShowcase() {
  // naano shows two rows of three inside the window
  const featured = CREATORS.slice(0, 6);

  return (
    <section
      className="relative overflow-hidden px-5 pb-[94px] pt-[78px] sm:pb-[104px] sm:pt-[86px] lg:px-[83.6px] lg:pb-[160px] lg:pt-[132px]"
      style={{
        // verbatim from naano's computed styles
        backgroundImage:
          "radial-gradient(circle at 50% 60%, rgba(208, 237, 251, 0.35), rgba(0, 0, 0, 0) 44%), linear-gradient(rgb(252, 252, 251) 0%, rgb(248, 252, 254) 62%, rgb(242, 250, 255) 100%)",
      }}
    >
      <div className="relative z-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.68] px-[14px] py-[7px] text-[13px] font-[650] leading-none text-[#555b63]">
          <span className="size-[7px] rounded-full bg-[#93c5fd]" />
          The Naano creator marketplace
        </span>

        <h2 className="mx-auto mt-[25px] max-w-[840px] text-[38px] font-semibold leading-[1.06] tracking-[-0.04em] nn-h2--marketplace text-[#111318]">
          Work with all the
          <br />
          best creators.
        </h2>

        <p className="mx-auto mt-[19px] max-w-[650px] text-[21px] leading-[31.92px] text-[#525861]">
          Find the right B2B voices, compare their audience fit, and book every
          collaboration from one place.
        </p>
      </div>

      {/* app preview, sitting on their atmosphere backdrop */}
      <div className="relative z-10 mx-auto mt-12 w-full lg:mt-[88px] lg:w-[1380px] lg:max-w-[calc(100%-112px)]">
        {/* naano's backdrop file, marketplace-atmosphere-v1.png, is not a clean
            gradient — it bakes in their own app screenshot, so their creators'
            faces bleed through above and below the window. Drawn as a gradient
            panel instead. */}
        {/* .lp-marketplace__stage — 1380 wide, padding 82/68/90, radius 48.
            Their backdrop file bakes in a screenshot of their own app, so the
            real creators' faces bleed through it; drawn as a gradient instead. */}
        <div className="@container rounded-[28px] border border-[rgba(139,189,215,0.32)] bg-[linear-gradient(180deg,#dff3fc_0%,#edf9fe_72%,#ffffff_100%)] px-[10px] pb-9 pt-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_42px_90px_-48px_rgba(69,119,145,0.38)] lg:rounded-[48px] lg:px-[68px] lg:pb-[90px] lg:pt-[82px] lg:h-[873px]">
          {/* .lp-marketplace__product-shell — 1242 x 767, radius 25 */}
          <div className="nn-app-shell mx-auto w-full max-w-[1242px] overflow-hidden rounded-[18px] border border-[rgba(17,19,24,0.12)] bg-white shadow-[inset_0_2px_0_0_rgba(255,255,255,0.9),0_44px_96px_-40px_rgba(25,58,76,0.46)] lg:h-[767px] lg:rounded-[25px]">
            {/* browser chrome */}
            <div className="flex h-[54px] items-center gap-4 border-b border-line/70 bg-[rgba(250,252,253,0.96)] px-[23px]">
              <div className="flex gap-[7px]">
                <span className="size-[11px] rounded-full bg-[#e2e2df]" />
                <span className="size-[11px] rounded-full bg-[#e2e2df]" />
                <span className="size-[11px] rounded-full bg-[#e2e2df]" />
              </div>
              <div className="mx-auto flex h-[31px] w-[420px] items-center justify-center gap-[7px] rounded-[9px] border border-[#e6eaed] bg-white text-[12px] text-[#76808a]">
                <svg
                  viewBox="0 0 24 24"
                  className="size-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 018 0v3" />
                </svg>
                naano.co/marketplace
              </div>
            </div>

            {/* naano drops a 1664-wide screenshot of the real app into a
                1240 window — scaled to 0.745. Ours renders the live markup at
                that same native width and scales it identically, so the cards
                keep the proportions they have in the product instead of being
                redrawn at a smaller size. */}
            <div className="nn-app-screen overflow-hidden bg-[#f5f7fa]">
              <div className="nn-app-canvas flex">
                <div className="flex w-[64px] shrink-0 flex-col items-center gap-5 border-r border-line/70 py-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/lp/naano-logo-nav.png"
                    alt=""
                    className="h-[16px] w-auto object-contain"
                  />
                  {RAIL.map((k, i) => (
                    <span
                      key={k}
                      className={`grid size-8 place-items-center rounded-lg ${
                        i === 1 ? "bg-brand-soft text-brand" : "text-[#b4b4b0]"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="size-[18px]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d={RAIL_PATHS[k]} />
                      </svg>
                    </span>
                  ))}
                  <span className="mt-auto size-8 rounded-full bg-[#17181c]" />
                </div>

                <div className="relative flex-1 bg-[#f5f7fa]">
                  <div className="grid grid-cols-3 gap-6 p-8">
                    {featured.map((c, i) => (
                      <CreatorCard
                        key={c.id}
                        creator={c}
                        rank={i + 1}
                        preview
                      />
                    ))}
                  </div>

                  {/* the small chevron naano floats between the rows */}
                  <span className="pointer-events-none absolute bottom-[86px] left-1/2 grid size-8 -translate-x-1/2 place-items-center rounded-full border border-line bg-white text-[#9b9da3] shadow-sm">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three claims under the preview. naano illustrates each one; mine were
          text-only boxes. The avatars are this project's generated ones, not
          the photographs of real creators theirs uses. */}
      <div className="relative z-10 mx-auto mt-[28px] grid w-[1280px] max-w-[calc(100%-112px)] grid-cols-1 gap-5 lg:grid-cols-3">
        {CLAIMS.map((claim, i) => (
          <div
            key={claim.title}
            /* naano: 401x268, radius 26, padding 26/28/28, white at 82%.
               The cloud is not a gradient — it is .lp-marketplace__signal-cloud,
               a child painting cloud-layer-bottom-v1.png at 145% size, pulled
               28px left and 42px below the card so it bleeds and gets clipped. */
            className="relative flex h-[276px] flex-col justify-between overflow-hidden rounded-[26px] bg-white/[0.82] px-7 pb-7 pt-[26px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-[-42px] left-[-28px] h-[142px] w-[469px] max-w-none"
              style={{
                backgroundImage: "url('/lp/cloud-layer-bottom.png')",
                backgroundSize: "145%",
                backgroundPosition: "50% 100%",
                backgroundRepeat: "no-repeat",
                opacity: 0.82,
              }}
            />
            <div className="relative z-10 flex flex-1 items-center">
              {i === 0 && <AvatarCluster />}
              {i === 1 && <FlagGrid />}
              {i === 2 && <MatchDiagram />}
            </div>
            <div className="relative z-10">
              <div className="text-[19px] font-bold tracking-[-0.01em] text-[#111318]">
                {claim.title}
              </div>
              <div className="mt-1.5 text-[13.5px] leading-relaxed text-[#69717a]">
                {claim.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Five creator avatars in a shallow arc.
 *
 * Measured from naano: rings ~62-65px sitting ~61px apart, so they nearly touch
 * rather than stack, each nudged a few pixels up or down to trace an arc, with
 * slight size variation. Ring is white at 94%.
 *
 * The photographs are naano's own avatar files, used here because the brief is
 * to reproduce their page exactly. They are Naano's assets, not this project's,
 * and the README says so.
 */
const CLUSTER = [
  { file: "a", ring: 62, photo: 54, dy: 11, rot: "-5deg", delay: "0s" },
  { file: "d", ring: 61, photo: 53, dy: 4, rot: "3deg", delay: "-0.7s" },
  { file: "g", ring: 60, photo: 52, dy: 0, rot: "-2deg", delay: "-1.4s" },
  { file: "b", ring: 62, photo: 54, dy: 7, rot: "4deg", delay: "-2.1s" },
  { file: "e", ring: 63, photo: 55, dy: 15, rot: "-3deg", delay: "-2.8s" },
];

function AvatarCluster() {
  return (
    <div className="flex w-full items-start justify-center pt-2">
      {CLUSTER.map((a, i) => (
        <span
          key={a.file}
          className="nn-avatar-float grid shrink-0 place-items-center rounded-full bg-white/[0.94] shadow-[0_6px_16px_-6px_rgba(15,23,42,0.35)]"
          style={
            {
              width: a.ring,
              height: a.ring,
              marginLeft: i === 0 ? 0 : -2,
              marginTop: a.dy,
              zIndex: CLUSTER.length - i,
              // naano staggers by -0.7s so the five never bob in unison
              animationDelay: a.delay,
              "--avatar-rot": a.rot,
            } as React.CSSProperties
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/lp/avatar-${a.file}.png`}
            alt=""
            className="rounded-full object-cover"
            style={{ width: a.photo, height: a.photo }}
          />
        </span>
      ))}
    </div>
  );
}

/** Seven flags as raised chips, four over three. */
function FlagGrid() {
  const rot = ["-6deg", "4deg", "-3deg", "7deg", "5deg", "-5deg", "3deg"];
  const delay = ["-0.4s", "-1.1s", "-1.8s", "-2.5s", "-3.2s", "-3.9s", "-4.6s"];
  const chip =
    "nn-flag-float grid h-[38px] w-[50px] place-items-center rounded-[10px] bg-white text-[23px] leading-none shadow-[0_4px_12px_-4px_rgba(15,23,42,0.32)]";
  const style = (i: number) =>
    ({ animationDelay: delay[i], "--flag-rot": rot[i] }) as React.CSSProperties;

  return (
    <div className="flex w-full flex-col items-center gap-3.5 pt-1">
      <div className="flex gap-4">
        {FLAGS.slice(0, 4).map((f, i) => (
          <span key={f} className={chip} style={style(i)}>
            {f}
          </span>
        ))}
      </div>
      <div className="flex gap-4">
        {FLAGS.slice(4).map((f, i) => (
          <span key={f} className={chip} style={style(i + 4)}>
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * naano lays this out as a three-column grid — 96px creator, 86px bridge,
 * 110px segments — with an SVG arc (M3 37 C27 4 68 4 93 36) whose dashes crawl
 * toward the score, and the score badge pulsing on top of it.
 */
function MatchDiagram() {
  return (
    <div className="grid w-full justify-center gap-0 [grid-template-columns:96px_86px_110px]">
      <div className="flex flex-col items-center">
        <span className="grid size-[58px] place-items-center rounded-full bg-white shadow-[0_6px_16px_-6px_rgba(15,23,42,0.35)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lp/avatar-f.png"
            alt=""
            className="size-[52px] rounded-full object-cover"
          />
        </span>
        <span className="mt-2 whitespace-nowrap text-[9px] font-bold text-[#66737c]">
          AI &amp; SaaS creator
        </span>
      </div>

      <div className="relative self-center">
        <svg
          viewBox="0 0 96 52"
          className="h-[52px] w-[86px] overflow-visible"
          fill="none"
          aria-hidden
        >
          <path
            d="M3 37 C27 4 68 4 93 36"
            stroke="#a9c4d6"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="5 6"
            className="nn-match-dash"
          />
        </svg>
        <span
          className="nn-score-pulse absolute left-1/2 top-[-14px] grid size-[46px] place-items-center rounded-full border-[3px] border-white bg-[#e7f1f8] text-[15px] font-extrabold text-[#315b7c]"
          style={{ transform: "translate(-50%)" }}
        >
          96%
        </span>
      </div>

      <div className="flex flex-col justify-center gap-[7px]">
        {ICP_PILLS.map((p) => (
          <span
            key={p}
            className="whitespace-nowrap rounded-full border border-[#e6eaee] bg-white px-2.5 py-[7px] text-center text-[9px] font-[750] text-[#56666f] shadow-[0_2px_6px_-3px_rgba(15,23,42,0.25)]"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
