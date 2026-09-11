"use client";

import { useEffect, useRef, useState } from "react";

const QUOTE =
  "“We manage €10M+ of influence budget every year. For B2B, Naano simply makes our life easier”";

/**
 * The Zmirov testimonial, the section naano puts directly after the hero.
 *
 * Authored values from their page at 1672: quote 52px / 62.4px line-height,
 * centred, 44px below the logo. Their max-width is 1160, but stock Inter sets
 * wider than their "Inter LP", so at 1160 the lines pack more words and break
 * in the wrong places. The measure is narrowed to reproduce their line breaks,
 * which is what actually reads as the same block. Each word is its own span
 * starting at opacity 0.14 and filling in as the block scrolls through the
 * viewport — that reveal is why their markup splits on whitespace, and the
 * final word carries their accent blue.
 */
export function Testimonial() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setProgress(1);
      return;
    }

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 when the block enters from below, 1 once it has risen past the middle
        const p = (vh * 0.85 - r.top) / (vh * 0.55);
        setProgress(Math.min(1, Math.max(0, p)));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const words = QUOTE.split(" ");
  const lit = progress * (words.length + 4);

  return (
    <section className="bg-[#fcfcfb]" id="proof">
      <div ref={ref} className="mx-auto flex flex-col items-center px-5 py-[72px] text-center lg:px-[84px] lg:py-[96px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lp/logo-zmirov.png"
          alt="Zmirov Communication"
          width={164}
          height={46}
          className="h-[46px] w-[164px] object-contain"
        />
        <span className="mt-[20px] block h-[2px] w-[46px] rounded-[2px] bg-[#2563eb]" />

        <blockquote className="mt-[44px] max-w-[1160px] text-[26px] font-medium leading-[1.28] lg:text-[52px] lg:leading-[62.4px] tracking-[-0.022em]">
          {words.map((w, i) => {
            const last = i === words.length - 1;
            // words light up a few at a time as the section rises
            const on = i < lit;
            return (
              <span
                key={`${w}-${i}`}
                className="transition-opacity duration-500 ease-out"
                style={{
                  opacity: on ? 1 : 0.14,
                  color: last ? "#2563eb" : "#17181c",
                }}
              >
                {w}
                {i < words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </blockquote>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lp/photo-david-zmirov.png"
          alt=""
          width={104}
          height={104}
          className="mt-[52px] size-[104px] rounded-full object-cover"
        />
        <div className="mt-[20px] text-[19px] font-bold leading-[23px] text-[#17181c]">David Zmirov</div>
        <div className="mt-[6px] text-[16px] leading-5 text-[#55575e]">CEO, Zmirov Communication</div>
        <div className="mt-[4px] text-[15px] leading-[19px] text-[#9b9da3]">Influence agency</div>
      </div>
    </section>
  );
}
