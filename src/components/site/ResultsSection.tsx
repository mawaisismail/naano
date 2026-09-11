import { PostCard, POSTS } from "./PostCard";

/**
 * "Proven across thousands of campaigns." — naano's results section, the last
 * block of the landing page before the footer.
 *
 * Authored from their page at 1672:
 *   section    padding 118px 84px 72px, relative, overflow hidden, isolate
 *              linear-gradient(#fff 0%, #f3faff 38%, #fff 100%)
 *              ::before  cloud-layer-bottom-v1 at 112% / 50% 100%, opacity .2,
 *                        1939.5 x 360, sat -90px below the bottom edge
 *   eyebrow    flex gap 10, 9px #315b7c dot + 14px/700/3.08px #315b7c
 *   h2         margin-top 24, 56px / 57.68px / 600 / -2.52px, max-width 940
 *   band       .lp-results-proof 1180 x 310, margin-top 42, radius 34,
 *              padding 40px 22px, linear-gradient(#eff9fe/.5, #fff/.18),
 *              overflow hidden, with results-metrics-clouds covering it at .92
 *   stat       272 x 135.2, 4 up, gap 16, radius 22, white 64%, 1px white/90,
 *              blur(12px) saturate(1.08), 0 22px 48px -38px #2e566c/42
 *              value 54px/54px/660/-2.7px, label 13.5px/18.225px #697b86 mt 11
 *   posts      .lp-result-grid 1320 wide, margin-top 50, padding 10px 6px 28px,
 *              4 x 313.5, gap 18; card 568 tall, radius 26, 1px #aaccdd/80
 *   cta        margin-top 44, dark pill 16px 28px radius 12, sub 15px #9b9da3
 */

const STATS = [
  ["5M+", "Impressions generated"],
  ["30K+", "Leads generated"],
  ["2,000+", "Creators on Naano"],
  ["5K+", "Posts published"],
] as const;

export function ResultsSection() {
  return (
    <section
      id="results"
      className="relative isolate overflow-hidden px-5 pb-[56px] pt-[64px] lg:px-[84px] lg:pb-[72px] lg:pt-[118px]"
      style={{ background: "linear-gradient(#ffffff 0%, #f3faff 38%, #ffffff 100%)" }}
    >
      {/* .lp-system-results::before — a wide cloud bank hung mostly below the
          section's bottom edge, softening the seam into the footer. Sized off
          the section, not the viewport.

          Their rule says opacity .2, but on the live site that layer paints
          nothing: sampling their section bottom gives a flat rgb(251,253,254)
          with about 2 levels of variation, where this image at .2 swings ~10.
          Matching the render rather than the stylesheet, so the seam reads as
          the same near-white fade instead of a visible bank of cloud. */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-[-90px] left-[-134px] right-[-134px] z-0 h-[360px] opacity-[0.04]"
        style={{
          backgroundImage: "url('/lp/cloud-layer-bottom-v1.png')",
          backgroundSize: "112%",
          backgroundPosition: "50% 100%",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative z-[2] flex items-center justify-center gap-[10px]">
        <span className="size-[9px] rounded-full bg-[#315b7c]" />
        <span className="text-[12px] font-bold uppercase leading-[17px] tracking-[2.64px] text-[#315b7c] lg:text-[14px] lg:tracking-[3.08px]">
          The results
        </span>
      </div>

      <h2 className="relative z-[2] mx-auto mt-[24px] max-w-[940px] text-center text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#111318] nn-h2">
        {/* naano's heading only wraps once the fluid size caps at 56px, which
            is 1556px of viewport. Below that it sits on one line. */}
        Proven across thousands
        <br className="hidden min-[1556px]:inline" /> of campaigns.
      </h2>

      {/* ------------------------------------------------------- stat band */}
      <div
        className="relative z-[1] mx-auto mt-[42px] grid w-full max-w-[1180px] items-center overflow-hidden rounded-[34px] px-[22px] py-[40px] lg:min-h-[310px]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(239, 249, 254, 0.5), rgba(255, 255, 255, 0.18))",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lp/results-metrics-clouds.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-[0.92]"
        />
        <div className="relative grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map(([value, label]) => (
            <div
              key={label}
              className="rounded-[22px] border border-white/90 bg-white/[0.64] px-[14px] pb-[24px] pt-[26px] text-center shadow-[0_22px_48px_-38px_rgba(46,86,108,0.42),inset_0_1px_0_0_#fff] backdrop-blur-[12px] backdrop-saturate-[1.08]"
            >
              <div className="text-[30px] font-[660] leading-none tracking-[-0.04em] text-[#111318] sm:text-[38px] lg:text-[54px] lg:leading-[54px] lg:tracking-[-2.7px]">
                {value}
              </div>
              <span className="mt-[11px] block text-[13.5px] leading-[18.225px] text-[#697b86]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------- post cards */}
      <div className="relative z-[1] mx-auto mt-[50px] grid w-full max-w-[1320px] grid-cols-1 gap-[18px] px-0 pb-[28px] pt-[10px] lg:grid-cols-4 lg:px-[6px]">
        {POSTS.map((post) => (
          <PostCard key={post.name} post={post} />
        ))}
      </div>

      {/* ------------------------------------------------------------- cta */}
      <div className="relative z-[1] mt-[44px] flex flex-col items-center">
        <a
          href="/register"
          className="flex items-center gap-[11px] rounded-[12px] bg-[#17181c] px-7 py-4 text-[16px] font-semibold leading-5 text-white shadow-[0_12px_30px_rgba(23,24,28,0.18)] transition hover:opacity-90"
        >
          Get started
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h13M13 6l6 6-6 6" />
          </svg>
        </a>
        <span className="mt-4 text-[15px] leading-[19px] text-[#9b9da3]">
          Start free. Pay per post when you&rsquo;re ready.
        </span>
      </div>
    </section>
  );
}
