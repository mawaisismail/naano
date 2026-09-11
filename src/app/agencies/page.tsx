import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ScaleFrame } from "@/components/site/ScaleFrame";

/**
 * /agencies — "Choose the workspace that matches your agency."
 *
 * Authored at 1672 from naano's computed styles:
 *   hero     926 tall, padding 64px 84px 88px, #c5ebfd under the cotton-blue
 *            cloud photo (1789 x 990.8, offset -59) and a 170px bottom fade
 *            badge 12/750/1.56 uppercase; h1 mt 38, 77/79.31/600/-3.465,
 *            max-w 980; lead mt 28, 20/31 #43454c, max-w 700; cta mt 40
 *   choices  952.45 tall, padding 88px 84px 104px, #fcfcfb -> #f7fbfd
 *            header 1320 (margin 0 92 48); grid 2 x 659 in one white
 *            radius-18 box with a 1px #dfe5e7 hairline
 *   book     659.19 tall, padding 132px 84px 158px, with the cloud bank at .24
 */

export const metadata: Metadata = {
  title: "Naano for agencies — Brand and creator operations",
  description:
    "Naano separates brand operations from creator management. Choose your setup and create the right workspace for your agency.",
};

const ARROW = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h13" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

const CHECK = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#54778a]" aria-hidden>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const CARDS = [
  {
    num: "01",
    type: "Brand agency",
    title: "I manage campaigns for companies",
    blurb:
      "Operate separate client workspaces, budgets, campaigns and reporting from one portfolio.",
    points: [
      "Create one workspace per client",
      "Add and allocate client budgets",
      "Track campaigns and next actions",
    ],
    cta: "Create a brand agency workspace",
    href: "/register?role=saas",
    note: "You will create the agency manager account first.",
  },
  {
    num: "02",
    type: "Creator agency",
    title: "I represent and manage creators",
    blurb:
      "Import your roster, manage every profile and run collaborations without creator logins.",
    points: [
      "Import any creator roster CSV",
      "Manage rates and creator profiles",
      "Track collaborations and earnings",
    ],
    cta: "Create a creator agency workspace",
    href: "/register?role=influencer",
    note: "Your creators do not need individual Naano accounts.",
  },
];

export default function AgenciesPage() {
  return (
    <ScaleFrame maxZoom={1}>
      <Nav cta={{ label: "Choose your agency", href: "/agencies#choose" }} />

      {/* ------------------------------------------------------------- hero */}
      <section data-nav-hero className="relative overflow-hidden bg-[#c5ebfd] pt-[73px] text-center">
        {/* .lp-cloud-scene — their photo is larger than the hero and offset
            left, so the sky reads open at the top with cloud only at the edges. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lp/hero-clouds-cotton.jpg"
          alt=""
          aria-hidden
          className="absolute left-0 top-0 z-0 h-full w-full max-w-none select-none object-cover lg:left-[-59px] lg:h-[990.8px] lg:w-[1789px]"
        />
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-[-1px] z-[3] h-[170px]"
          style={{
            background:
              "linear-gradient(rgba(252,252,251,0) 0%, rgba(252,252,251,0.74) 70%, #fcfcfb 100%)",
          }}
        />

        {/* naano runs a 74px spacer above a 926px hero; the clouds still sit
            behind the transparent bar, so the section carries the bar's height
            and the content centres in the 926 below it. */}
        <div className="relative z-[2] flex min-h-[560px] flex-col items-center justify-center px-5 pb-[88px] pt-[64px] lg:min-h-[calc(100vh/var(--nn-zoom,1)-73px)] lg:px-[84px]">
          <div className="flex rounded-full border border-white/95 bg-white/95 px-[18px] py-[9px] text-[12px] font-[750] uppercase leading-[17px] tracking-[1.56px] text-[#526978] shadow-[0_4px_14px_rgba(42,73,117,0.055)] backdrop-blur-[8px]">
            Naano for agencies
          </div>
          <h1 className="mt-[38px] max-w-[980px] text-[40px] font-semibold leading-[1.05] tracking-[-0.045em] text-[#111318] lg:text-[77px] lg:leading-[79.31px] lg:tracking-[-3.465px]">
            Choose the workspace
            <br className="max-lg:hidden" /> that matches your agency.
          </h1>
          <p className="mt-7 max-w-[700px] text-[17px] leading-[27px] text-[#43454c] lg:text-[20px] lg:leading-[31px]">
            Naano separates brand operations from creator management. Choose your
            setup and create the right workspace for your agency.
          </p>
          <Link
            href="#choose"
            className="mt-10 flex items-center justify-center gap-[11px] rounded-[12px] bg-[#17181c] px-7 py-4 text-[16px] font-semibold leading-5 text-white transition hover:opacity-90"
          >
            Choose your agency
            {ARROW}
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------------- choices */}
      <section
        id="choose"
        className="scroll-mt-20 px-5 pb-[72px] pt-[64px] lg:px-[84px] lg:pb-[104px] lg:pt-[88px]"
        style={{ background: "linear-gradient(#fcfcfb 0%, #f7fbfd 100%)" }}
      >
        <div className="mx-auto w-full max-w-[1320px]">
          <header className="mb-12">
            <span className="text-[12px] font-[750] uppercase leading-[15px] tracking-[1.68px] text-[#60727c]">
              Two distinct products
            </span>
            <h2 className="mt-4 max-w-[760px] text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#111318] lg:text-[56px] lg:leading-[57.68px] lg:tracking-[-2.52px]">
              What does your agency manage?
            </h2>
          </header>

          <div className="grid grid-cols-1 overflow-hidden rounded-[18px] border border-[#dfe5e7] bg-white lg:grid-cols-2">
            {CARDS.map((card, i) => (
              <article
                key={card.num}
                className={`flex min-h-[530px] flex-col bg-white p-7 lg:p-12 ${
                  i === 1 ? "border-t border-[#dfe5e7] lg:border-l lg:border-t-0" : ""
                }`}
              >
                <div className="flex items-center justify-between pb-7">
                  <span className="text-[11px] font-extrabold leading-[14px] tracking-[1.1px] text-[#54778a]">
                    {card.num}
                  </span>
                  <span className="text-[12px] font-[750] uppercase leading-[15px] tracking-[1.68px] text-[#60727c]">
                    {card.type}
                  </span>
                </div>

                <h3 className="mt-[34px] max-w-[490px] text-[28px] font-[650] leading-[1.1] tracking-[-0.03em] text-[#111318] lg:text-[36px] lg:leading-[39.6px] lg:tracking-[-1.26px]">
                  {card.title}
                </h3>
                <p className="mt-[18px] max-w-[520px] text-[16px] leading-[25.28px] text-[#5f6670]">
                  {card.blurb}
                </p>

                <ul className="mb-[38px] mt-8 grid gap-[14px]">
                  {card.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-[11px] text-[15px] leading-[19px] text-[#33353b]">
                      {CHECK}
                      {pt}
                    </li>
                  ))}
                </ul>

                <Link
                  href={card.href}
                  className="mt-auto flex items-center justify-between gap-4 rounded-[12px] bg-[#17181c] px-[18px] py-4 text-[15px] font-[650] leading-[19px] text-white transition hover:opacity-90"
                >
                  {card.cta}
                  {ARROW}
                </Link>
                <small className="mt-[14px] text-[12px] leading-[17.4px] text-[#8993a2]">
                  {card.note}
                </small>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- book */}
      <section
        className="relative overflow-hidden px-5 pb-[96px] pt-[80px] text-center lg:px-[84px] lg:pb-[158px] lg:pt-[132px]"
        style={{ background: "linear-gradient(#f7fbfd 0%, #e5f5fc 48%, #d9f0fb 100%)" }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-[-210px] left-[-83.6px] right-[-83.6px] z-0 h-[560px] bg-[url('/lp/book-clouds.jpg')] bg-cover bg-[50%_100%] opacity-[0.24]"
        />
        <div className="relative z-[1] mx-auto max-w-[880px]">
          <span className="text-[12px] font-[750] uppercase leading-[15px] tracking-[1.68px] text-[#54778a]">
            Talk to Naano
          </span>
          <h2 className="mt-5 text-[36px] font-semibold leading-[1.06] tracking-[-0.04em] text-[#111318] lg:text-[60px] lg:leading-[61.8px] lg:tracking-[-2.7px]">
            Not sure which workspace fits your agency?
          </h2>
          <p className="mx-auto mt-[26px] max-w-[660px] text-[17px] leading-[27px] text-[#555f68] lg:text-[18px] lg:leading-[28.8px]">
            Book a 30-minute agency call. We will look at how you manage clients
            or creators and point you to the right setup.
          </p>
          <Link
            href="/book"
            className="mx-auto mt-[38px] inline-flex items-center justify-center gap-2.5 rounded-[12px] bg-[#17181c] px-6 py-4 text-[16px] font-[650] leading-5 text-white transition hover:opacity-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="5" width="18" height="16" rx="3" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
            Book a call
            {ARROW}
          </Link>
          <small className="mt-4 block text-[13px] leading-4 text-[#70818c]">
            30 minutes with the Naano team. No commitment.
          </small>
        </div>
      </section>

      <Footer />
    </ScaleFrame>
  );
}
