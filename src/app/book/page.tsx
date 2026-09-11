import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ScaleFrame } from "@/components/site/ScaleFrame";

/**
 * /book — the destination for every "Book a call" on naano. Theirs opens a
 * scheduler; this build has no calendar behind it, so the page says what the
 * call covers and routes to the product instead of faking a booking.
 */

export const metadata: Metadata = {
  title: "Book a campaign call — Naano",
  description:
    "A 30-minute working session: creator strategy, campaign format and a budget recommendation for your next launch.",
};

const BULLETS = ["Creator strategy", "Campaign format", "Budget recommendation"];

export default function BookPage() {
  return (
    <ScaleFrame>
      <Nav />

      <main
        className="relative overflow-hidden px-5 pb-24 pt-[144px] lg:px-[84px]"
        style={{ background: "linear-gradient(#ffffff 0%, #e5f5fc 54%, #d8effa 100%)" }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-[-80px] left-[-83.6px] right-[-83.6px] z-0 h-[560px] bg-[url('/lp/book-clouds.jpg')] bg-cover bg-[50%_100%] opacity-[0.28]"
        />
        <div className="relative z-[1] mx-auto max-w-[560px] text-center">
          <div className="text-[12px] font-bold uppercase leading-[15px] tracking-[1.92px] text-[#315b7c]">
            Campaign strategy call
          </div>
          <h1 className="mt-5 text-[36px] font-semibold leading-[1.06] tracking-[-0.04em] text-[#111318] lg:text-[52px]">
            30-minute working session
          </h1>
          <p className="mx-auto mt-6 text-[17px] leading-[27px] text-[#55575e] lg:text-[19px]">
            Leave with a concrete plan for your next creator campaign.
          </p>

          <div className="mt-10 rounded-[30px] border border-white/95 bg-white/[0.88] p-7 text-left shadow-[0_38px_90px_-56px_rgba(45,87,110,0.5)] backdrop-blur-[20px] lg:p-10">
            {BULLETS.map((b) => (
              <div
                key={b}
                className="flex items-center gap-[11px] border-t border-[rgba(203,224,238,0.72)] py-[15px] text-[15.5px] leading-5 text-[#26272c] first:border-t-0 first:pt-0"
              >
                <span className="size-[5px] shrink-0 rounded-full bg-[#315b7c]" />
                {b}
              </div>
            ))}

            <div className="mt-6 rounded-[16px] bg-[#f4f9fc] p-5 text-[15px] leading-[24px] text-[#55707e]">
              Naano opens a scheduler here. This build is a take-home rebuild
              with no calendar behind it, so nothing is booked — browse the
              marketplace or create an account and the rest of the product works.
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/marketplace"
                className="flex flex-1 items-center justify-center gap-2.5 rounded-[12px] bg-[#17181c] px-7 py-4 text-[16px] font-semibold leading-5 text-white transition hover:opacity-90"
              >
                Browse the marketplace
              </Link>
              <Link
                href="/register"
                className="flex flex-1 items-center justify-center rounded-[12px] border border-[#d9d6d0] bg-white px-7 py-4 text-[16px] font-semibold leading-5 text-[#17181c] transition hover:border-[#bfc7cd]"
              >
                Start for free
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </ScaleFrame>
  );
}
