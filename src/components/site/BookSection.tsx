import Link from "next/link";

/**
 * "Your next creator campaign starts here." — naano's closing booking block.
 *
 * Authored at 1672 from their computed styles:
 *   section  1672 x 1212, padding 128px 84px 170px, overflow hidden
 *            linear-gradient(#fff 0%, #e5f5fc 54%, #d8effa 100%)
 *            ::before hero-clouds-cotton-blue at cover / 50% 100%, opacity .34,
 *            1839.2 x 640, inset -83.6 left/right, -80 bottom
 *   head     820 wide centred; eyebrow 12/700/1.92 #315b7c;
 *            h2 mt 20, 60/61.8/600/-2.7; lead mt 26, max-w 600, 19/29.45
 *   card     550 x 557.5, padding 48px 48px 44px, radius 30, white 86%,
 *            1px white 96%, 0 38px 90px -56px #2d576e/50 + inset white top,
 *            backdrop blur(20) saturate(1.12)
 *   bullets  3 rows of 50 (padding 15px 0), 1px top rule #cbe0ee/72,
 *            5px #315b7c dot, gap 11, 15.5px #26272c
 *   foot     mt 40, 14px #9b9da3, centred
 */

const BULLETS = ["Creator strategy", "Campaign format", "Budget recommendation"];

export function BookSection() {
  return (
    <section
      id="book"
      className="relative overflow-hidden px-5 pb-[100px] pt-[86px] lg:px-[84px] lg:pb-[170px] lg:pt-[128px]"
      style={{
        background: "linear-gradient(#ffffff 0%, #e5f5fc 54%, #d8effa 100%)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-[-80px] left-[-83.6px] right-[-83.6px] z-0 h-[640px] bg-[url('/lp/book-clouds.jpg')] bg-cover bg-[50%_100%] opacity-[0.34]"
      />

      <div className="relative z-[2] mx-auto max-w-[820px] text-center">
        <div className="text-[12px] font-bold leading-[15px] tracking-[1.92px] text-[#315b7c]">
          READY TO LAUNCH?
        </div>
        <h2 className="mt-5 text-[36px] font-semibold leading-[1.06] tracking-[-0.04em] text-[#111318] nn-h2--book">
          Your next creator
          <br className="max-lg:hidden" /> campaign starts here.
        </h2>
        <p className="mx-auto mt-[26px] max-w-[600px] text-[17px] leading-[27px] text-[#55575e] lg:text-[19px] lg:leading-[29.45px]">
          Get a clear creator strategy, campaign format and estimated budget for
          your next launch.
        </p>
      </div>

      <div className="relative z-[2] mx-auto mt-14 flex w-full max-w-[560px] justify-center">
        <div className="flex w-full max-w-[550px] flex-col rounded-[30px] border border-white/95 bg-white/[0.86] p-7 shadow-[0_38px_90px_-56px_rgba(45,87,110,0.5),inset_0_1px_0_0_#fff] backdrop-blur-[20px] backdrop-saturate-[1.12] lg:px-12 lg:pb-11 lg:pt-12">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/lp/photo-book-call.jpg"
              alt=""
              className="size-10 shrink-0 rounded-full object-cover"
            />
            <div className="text-[12px] font-bold leading-[15px] tracking-[1.68px] text-[#315b7c]">
              CAMPAIGN STRATEGY CALL
            </div>
          </div>

          <h3 className="mt-5 text-[26px] font-extrabold leading-[1.15] tracking-[-0.025em] text-[#17181c] lg:text-[30px] lg:leading-[34.5px] lg:tracking-[-0.75px]">
            30-minute working session
          </h3>
          <p className="mt-[14px] text-[15.5px] leading-[24.025px] text-[#55575e]">
            Leave with a concrete plan for your next creator campaign.
          </p>

          <div className="mt-[30px]">
            {BULLETS.map((b) => (
              <div
                key={b}
                className="flex items-center gap-[11px] border-t border-[rgba(203,224,238,0.72)] py-[15px] text-[15.5px] leading-[19px] text-[#26272c]"
              >
                <span className="size-[5px] shrink-0 rounded-full bg-[#315b7c]" />
                {b}
              </div>
            ))}
          </div>

          <Link
            href="/book"
            className="mt-8 flex items-center justify-center gap-2.5 rounded-[12px] bg-[#17181c] px-7 py-4 text-[16px] font-semibold leading-5 tracking-[-0.16px] text-white transition hover:opacity-90"
          >
            Book a campaign call
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="4" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          <div className="mt-[14px] text-center text-[13.5px] leading-4 text-[#9b9da3]">
            Pick a time on the next page.
          </div>
          <Link
            href="/register"
            className="mt-5 text-center text-[14.5px] leading-[17px] tracking-[-0.0725px] text-[#55575e] transition hover:opacity-70"
          >
            Prefer to start yourself? <span className="font-semibold">Start for free →</span>
          </Link>
        </div>
      </div>

      <div className="relative z-[2] mt-10 text-center text-[14px] leading-[17px] tracking-[-0.07px] text-[#9b9da3]">
        Trusted by B2B teams building creator-led acquisition.
      </div>
    </section>
  );
}
