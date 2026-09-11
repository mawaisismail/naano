import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ScaleFrame } from "@/components/site/ScaleFrame";

/**
 * /case-studies/blogseo — naano's BlogSEO case study.
 *
 * Authored from their page: a 637 hero with the testimonial video beside the
 * headline, a six-up stat band, four numbered chapters at 96px top padding,
 * the pull quote, and the closing CTA. Their video is a 37MB mp4, so the
 * poster frame stands in, as on the landing page.
 */

export const metadata: Metadata = {
  title:
    "How BlogSEO turned creator marketing into a measurable acquisition channel — Naano case study",
  description:
    "After one €2,000 sponsored post returned just three sign-ups, BlogSEO rebuilt creator marketing on Naano, and turned it into predictable, trackable pipeline.",
};

const STATS = [
  ["150%", "Return on ad spend (ROAS)"],
  ["1,500+", "Qualified leads surfaced for outreach"],
  ["Hundreds", "Of sign-ups generated"],
  ["~20", "Creator posts published"],
  ["15", "Creators activated"],
  ["€5,000", "Campaign budget"],
] as const;

const CHAPTERS = [
  {
    n: "01",
    title: "The challenge",
    paras: [
      "Before Naano, BlogSEO had already tested influencer marketing. They paid €2,000 for a single sponsored post and generated only three sign-ups.",
      "The conclusion was simple: creator marketing looked expensive, difficult to track, and impossible to scale with confidence.",
      "They didn't need more reach. They needed a predictable way to find relevant creators, activate them at scale, and turn engagement into pipeline.",
    ],
    aside: [
      ["Old approach", "€2,000", "one sponsored post"],
      ["Result", "3 sign-ups", "no way to trace or repeat it"],
    ],
  },
  {
    n: "02",
    title: "The campaign",
    paras: [
      "BlogSEO launched a LinkedIn creator campaign with Naano, matched with ~10 relevant creators and a €5,000 budget.",
      "Over the campaign, creators published around 15 posts designed to reach BlogSEO's target audience and generate qualified demand. Every post was tracked through Naano, so the team could see which creators and which content generated real commercial intent.",
    ],
    aside: null,
  },
  {
    n: "03",
    title: "The results",
    paras: [
      "For BlogSEO, the value wasn't just visibility. The campaign created a structured list of people who had engaged, 1,500+ qualified leads surfaced in the dashboard, ready to reactivate through outbound.",
      "Instead of treating creator marketing as an awareness play, the team could connect creator content to leads, conversations, and revenue, landing at 150% ROAS.",
    ],
    aside: null,
  },
  {
    n: "04",
    title: "Why it worked",
    paras: ["The difference wasn't spending more on creators. Naano made the campaign operational."],
    list: [
      "Relevant creator matching instead of one expensive bet on a single influencer",
      "Multiple posts and angles instead of relying on one piece of content",
      "Centralized tracking across the entire campaign",
      "Qualified lead extraction directly into a dashboard",
      "Clear visibility into what actually drove commercial outcomes",
    ],
    aside: null,
  },
];

export default function BlogSeoCaseStudy() {
  return (
    <ScaleFrame>
      <Nav tone="paper" />

      {/* ------------------------------------------------------------- hero */}
      <section className="bg-[#fcfcfb] px-5 pb-10 pt-[144px] lg:px-14">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_460px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#17181c] px-3 py-1 text-[11px] font-bold uppercase tracking-[1.2px] text-white">
                Case study
              </span>
              <span className="text-[12px] font-bold uppercase tracking-[1.92px] text-[#315b7c]">
                LinkedIn creator campaign
              </span>
            </div>
            <h1 className="mt-7 max-w-[760px] text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#111318] lg:text-[52px]">
              How BlogSEO turned creator marketing into a measurable acquisition
              channel
            </h1>
            <p className="mt-6 max-w-[680px] text-[17px] leading-[27px] text-[#55575e] lg:text-[19px] lg:leading-[29px]">
              After one €2,000 sponsored post returned just three sign-ups,
              BlogSEO rebuilt creator marketing on Naano, and turned it into
              predictable, trackable pipeline.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href="https://www.linkedin.com/company/blogseo/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-[12px] bg-[#17181c] px-7 py-4 text-[16px] font-semibold leading-5 text-white transition hover:opacity-90"
              >
                View a campaign post
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M7 17 17 7" />
                  <path d="M9 7h8v8" />
                </svg>
              </a>
              <span className="text-[15px] text-[#8b8d94]">B2B SaaS · SEO</span>
            </div>
          </div>

          <div className="relative h-[500px] overflow-hidden rounded-[24px] border border-[#e7e9ec] bg-[#eef8fd]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/lp/vincent-poster.jpg"
              alt="Vincent Josse, CEO and founder of BlogSEO"
              className="absolute inset-0 size-full object-contain"
            />
            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(rgba(17,19,24,0),rgba(17,19,24,0.55))] p-5 text-white">
              <div className="text-[15px] font-bold leading-5">Vincent Josse</div>
              <div className="text-[13px] leading-[18px] opacity-90">
                CEO &amp; Founder, BlogSEO
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ stats */}
      <section className="bg-[#fcfcfb] px-5 py-10 lg:px-14">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-x-8 gap-y-9 lg:grid-cols-6">
          {STATS.map(([value, label]) => (
            <div key={label}>
              <div className="text-[32px] font-[660] leading-none tracking-[-0.035em] text-[#111318] lg:text-[40px]">
                {value}
              </div>
              <div className="mt-2.5 text-[14px] leading-[20px] text-[#69717a]">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- chapters */}
      {CHAPTERS.map((ch) => (
        <section key={ch.n} className="bg-[#fcfcfb] px-5 pt-16 lg:px-14 lg:pt-24">
          <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
            <div className="flex items-baseline gap-4 lg:flex-col lg:gap-2">
              <span className="text-[13px] font-bold tracking-[1.5px] text-[#b0b2b8]">{ch.n}</span>
              <h2 className="text-[24px] font-bold leading-[1.2] tracking-[-0.02em] text-[#17181c] lg:text-[28px]">
                {ch.title}
              </h2>
            </div>
            <div className="max-w-[760px]">
              {ch.paras.map((para) => (
                <p key={para} className="mt-5 text-[17px] leading-[29px] text-[#43454c] first:mt-0">
                  {para}
                </p>
              ))}

              {ch.list ? (
                <ul className="mt-7 space-y-3.5">
                  {ch.list.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[16px] leading-[26px] text-[#43454c]">
                      <span className="mt-[10px] size-[6px] shrink-0 rounded-full bg-[#315b7c]" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}

              {ch.aside ? (
                <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {ch.aside.map(([label, figure, note]) => (
                    <div key={label} className="rounded-[18px] border border-[#e4ecf1] bg-white p-6">
                      <div className="text-[12px] font-bold uppercase tracking-[1.2px] text-[#8b8d94]">
                        {label}
                      </div>
                      <div className="mt-2 text-[28px] font-extrabold leading-none tracking-[-0.03em] text-[#17181c]">
                        {figure}
                      </div>
                      <div className="mt-2 text-[14px] leading-5 text-[#69717a]">{note}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ))}

      {/* ------------------------------------------------------------ quote */}
      <section className="bg-[#fcfcfb] px-5 pt-20 lg:px-14 lg:pt-28">
        <figure className="mx-auto max-w-[900px] text-center">
          <blockquote className="text-[24px] font-medium leading-[1.35] tracking-[-0.02em] text-[#17181c] lg:text-[34px] lg:leading-[46px]">
            &ldquo;We had tried influencer marketing before and spent €2,000 on
            one post for three sign-ups. With Naano, we saw 150% ROAS and
            generated more than 1,500 leads we could follow up with.&rdquo;
          </blockquote>
          <figcaption className="mt-8 flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/lp/avatar-c.png" alt="" className="size-[56px] rounded-full object-cover" />
            <div className="mt-3.5 text-[17px] font-bold leading-[22px] text-[#17181c]">
              Vincent Josse
            </div>
            <div className="mt-1 text-[15px] leading-5 text-[#55575e]">
              CEO &amp; Founder, BlogSEO
            </div>
          </figcaption>
        </figure>
      </section>

      {/* -------------------------------------------------------------- cta */}
      <section className="bg-[#fcfcfb] px-5 pb-[120px] pt-20 text-center lg:px-14 lg:pt-28">
        <div className="mx-auto max-w-[820px]">
          <div className="text-[12px] font-bold uppercase leading-[15px] tracking-[1.92px] text-[#315b7c]">
            Build your LinkedIn creator campaign
          </div>
          <h2 className="mt-5 text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#111318] lg:text-[48px]">
            Turn creator engagement into pipeline.
          </h2>
          <p className="mx-auto mt-6 max-w-[660px] text-[17px] leading-[27px] text-[#55575e] lg:text-[19px]">
            Run a campaign with creators your buyers already trust, track the
            results, and turn engagement into revenue.
          </p>
          <Link
            href="/register?role=saas"
            className="mx-auto mt-9 inline-flex items-center gap-2.5 rounded-[12px] bg-[#17181c] px-7 py-4 text-[16px] font-semibold leading-5 text-white transition hover:opacity-90"
          >
            Launch your campaign with Naano
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </ScaleFrame>
  );
}
