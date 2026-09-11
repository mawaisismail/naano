import Link from "next/link";

/**
 * "Real teams. Measurable pipeline." — naano's case-study section.
 *
 * Authored from their page at 1672. Every card here is very slightly rotated,
 * so a getBoundingClientRect is a few px larger than the box it measures: a
 * full-width child of the left card reads +5.05px tall, of the right card
 * +2.96px. The numbers below are the real boxes, not the bounding ones.
 *
 *   section   #fbfdfe, padding 118px 84px 150px, content 1260 (margin 0 122px)
 *   h2        56px / 57.68px / 600 / -2.52px
 *   sub       19px / normal / #55575e, margin-top 16
 *   grid      margin-top 54, 1260 x 770.8, padding 34px 26px 68px,
 *             columns 42% / 58% of the 1208 content box, gap 0, align start
 *   panel     ::before inset 0, radius 38, white 42%, 1px #b7d3e0/35,
 *             inset 0 1px 0 white/90, backdrop-blur 8, z-index -1
 *   cards     radius 28, white 94%, 1px #bed3dd/48, 0 30px 72px -52px #2e4e5f/38
 *   left      507.359 wide, rotate(-0.65deg) translate(14.4756px, 41.8385px)
 *   right     calc(100% + 16px) wide, margin-left -16, rotate(0.28deg)
 *
 * Their video is a 37MB mp4. The poster frame is what shows at rest, so that is
 * what ships here — the play control links out rather than bundling the file.
 */

/** Both proof cards: white 94%, hairline, and the same long soft drop shadow. */
const CARD =
  "rounded-[28px] border border-[rgba(190,211,221,0.48)] bg-white/[0.94] " +
  "shadow-[0_30px_72px_-52px_rgba(46,78,95,0.38)]";

/** The rules inside the case-study card are their own 1px elements, not borders. */
const RULE = "h-px w-full bg-[#f0eeea]";

/** Each logo is capped at its own height on naano — one shared cap reads wrong. */
const TRUSTED = [
  ["lemlist", 34],
  ["folk", 24],
  ["leadbay", 22],
  ["ringover", 34],
  ["attio", 34],
  ["lagrowthmachine", 27],
  ["gojiberry", 26],
  ["chatseo", 32],
  ["abyssale", 24],
] as const;

const STATS = [
  ["9", "creators activated", "pr-[18px]"],
  ["2,940", "qualified clicks", "border-l border-[#f0eeea] px-[22px]"],
  ["512", "trials started", "border-l border-[#f0eeea] pl-[22px]"],
] as const;

export function ProofSection() {
  return (
    <section id="proof-teams" className="bg-[#fbfdfe] px-5 pb-[76px] pt-[64px] lg:px-[84px] lg:pb-[150px] lg:pt-[118px]">
      <div className="mx-auto w-full max-w-[1260px]">
        <h2 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] nn-h2 text-[#111318]">
          Real teams. Measurable pipeline.
        </h2>
        <p className="mt-4 text-[16px] leading-[1.45] text-[#55575e] lg:text-[19px] lg:leading-[normal]">
          See how B2B teams turn creator trust into attributable demand with Naano.
        </p>

        {/* The frame is a translucent blurred panel drawn by their ::before, sat
            behind both cards. The cards overlap by ~35px, left over right, which
            is why the right one carries 68px of left padding to clear it. */}
        <div className="relative isolate mx-auto mt-[34px] grid w-full max-w-[1260px] items-start px-4 pb-8 pt-5 lg:mt-[54px] lg:px-[26px] lg:pb-[68px] lg:pt-[34px] lg:grid-cols-[42%_58%]">
          <span
            aria-hidden
            className="absolute inset-0 -z-10 rounded-[38px] border border-[rgba(183,211,224,0.35)] bg-white/[0.42] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] backdrop-blur-[8px]"
          />

          {/* ------------------------------------------------------ testimonial */}
          <div className={`nn-proof-card--video relative z-[2] w-full p-5 lg:p-[30px] ${CARD}`}>
            <div className="text-[12px] font-bold uppercase leading-[normal] tracking-[2.64px] text-[#9b9da3]">
              Video testimonial
            </div>

            {/* Their 9:16 clip is letterboxed into a 4:3 well — object-contain over
                #eef8fd, not a crop. The name caption is burnt into the frame. */}
            <div className="relative mt-[18px] h-[260px] overflow-hidden lg:h-[340px] rounded-[20px] border border-[#e7e9ec] bg-[#eef8fd]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/lp/vincent-poster.jpg"
                alt="Vincent Josse, founder of BlogSEO"
                className="absolute inset-0 size-full object-contain"
              />
              <Link
                href="https://naano.com/case-studies/blogseo"
                aria-label="Play the BlogSEO video testimonial"
                className="absolute inset-0 z-[2] grid place-items-center bg-[linear-gradient(rgba(17,19,24,0.01),rgba(17,19,24,0.24))]"
              >
                <span className="grid size-[72px] place-items-center rounded-full bg-white/[0.94] transition hover:scale-105">
                  <svg viewBox="0 0 24 24" className="ml-[3px] size-[26px] text-[#111318]" fill="currentColor" aria-hidden>
                    <path d="M8 5l12 7-12 7z" />
                  </svg>
                </span>
                <span className="absolute bottom-3 right-[14px] rounded-[7px] bg-[rgba(23,24,28,0.78)] px-[9px] py-1 text-[12px] font-semibold text-white">
                  2:40
                </span>
              </Link>
            </div>

            <blockquote className="mt-[26px] text-[20px] font-semibold leading-[1.4] lg:text-[24px] lg:leading-[33.6px] tracking-[-0.36px] text-[#17181c]">
              “Naano became one of our fastest acquisition channels. We know exactly
              what every creator brings.”
            </blockquote>

            {/* Padding 0: the avatar is exactly as tall as the pill it sits in. */}
            <div className="mt-[22px] flex items-center gap-[13px] rounded-[20px] bg-[#eef8fd] p-px">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/lp/avatar-c.png"
                alt=""
                className="size-[46px] shrink-0 rounded-full object-cover"
              />
              <div className="leading-[normal]">
                <div className="text-[15px] font-bold text-ink">Vincent Josse</div>
                <div className="text-[13px] text-[#55575e]">CEO &amp; Founder, BlogSEO</div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------- case study */}
          <div
            className={`nn-proof-card--case relative z-[1] w-full pb-9 pl-[68px] pr-10 pt-9 max-lg:mt-4 max-lg:px-5 max-lg:py-6 lg:-ml-4 lg:w-[calc(100%+16px)] ${CARD}`}
          >
            <div className="flex items-center justify-between gap-6">
              <div className="text-[12px] font-bold uppercase leading-[normal] tracking-[2.64px] text-[#9b9da3]">
                Case study
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/lp/logo-blogseo.png" alt="BlogSEO" className="h-[26px] w-auto object-contain" />
            </div>

            <h3 className="mt-[22px] text-[22px] font-bold leading-[1.2] lg:text-[27px] lg:leading-[32.4px] tracking-[-0.02em] text-[#111318]">
              How BlogSEO turned creator content into product signups
            </h3>
            <p className="mt-[14px] text-[15.5px] leading-[24.025px] text-[#55575e]">
              BlogSEO briefed SEO &amp; SaaS creators on LinkedIn and X, then traced
              every trial back to the post that drove it, all in Naano.
            </p>

            <div className={`my-[26px] ${RULE}`} />

            <div className="grid grid-cols-3">
              {STATS.map(([n, l, box]) => (
                <div key={l} className={box}>
                  <div className="text-[28px] font-semibold leading-none lg:text-[38px] tracking-tight text-[#17181c]">
                    {n}
                  </div>
                  <div className="mt-2 text-[14px] text-[#8a949c]">{l}</div>
                </div>
              ))}
            </div>

            <Link
              href="https://naano.com/case-studies/blogseo"
              className="mt-[28px] flex w-fit items-center gap-2 text-[15.5px] font-semibold leading-[normal] text-ink transition hover:opacity-70"
            >
              Read case study
              <svg viewBox="0 0 24 24" className="size-[15px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h13M13 6l6 6-6 6" />
              </svg>
            </Link>

            <div className={`mb-[22px] mt-[30px] ${RULE}`} />

            <div className="text-[11px] font-bold uppercase leading-[normal] tracking-[2.2px] text-[#b0b2b8]">
              Trusted by teams at
            </div>
            {/* Fixed 124x40 cells wrapping four to a row — not a fluid grid. */}
            <div className="mt-[22px] flex flex-wrap items-center gap-x-[36px] gap-y-[22px]">
              {TRUSTED.map(([t, cap]) => (
                <div key={t} className="flex h-10 w-[124px] items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/lp/logo-${t}.png`}
                    alt={t}
                    style={{ maxHeight: cap }}
                    className="max-w-full object-contain"
                  />
                </div>
              ))}
              <span className="grid h-[26px] place-items-center rounded-full border border-[#d9d6d0] px-[14px] text-[14px] font-bold leading-[normal] tracking-[-0.14px] text-[#8b8d94]">
                +30
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
