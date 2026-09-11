"use client";

import { useEffect, useState } from "react";

/**
 * naano's bar is fixed, and it has two independent transitions. Scrolled
 * their page with a real wheel at 1672:
 *
 *   y=0      73 tall, #c5ebfd
 *   y>=~40   61 tall, still #c5ebfd while the hero is behind it
 *   past     61 tall, rgba(252,252,251,.82) + blur(18px) saturate(1.25)
 *            the hero
 *
 * So the height swaps almost immediately and the surface only turns to paper
 * once you have left the hero — which is why it reads as sky over the sky and
 * as frosted glass over everything after it.
 *
 * The hero marks itself with data-nav-hero. Pages without one (blog, tools,
 * legal) pass tone="paper" and start frosted.
 *
 * State reaches the bar's contents as data attributes rather than a render
 * prop: Nav is a server component, and a function cannot cross that boundary.
 */
const COMPACT_AT = 32;
const COMPACT_HEIGHT = 61;

export function NavShell({
  tone = "sky",
  children,
}: {
  tone?: "sky" | "paper";
  children: React.ReactNode;
}) {
  const [compact, setCompact] = useState(false);
  const [pastHero, setPastHero] = useState(tone === "paper");

  useEffect(() => {
    let heroHeight = 0;

    const measure = () => {
      const hero = document.querySelector("[data-nav-hero]");
      heroHeight = hero ? hero.getBoundingClientRect().height : 0;
    };

    const onScroll = () => {
      setCompact(window.scrollY > COMPACT_AT);
      setPastHero(
        tone === "paper" || window.scrollY > Math.max(0, heroHeight - COMPACT_HEIGHT),
      );
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [tone]);

  return (
    <header
      data-scrolled={compact}
      data-past-hero={pastHero}
      className={`group/nav fixed inset-x-0 top-0 z-50 transition-[background-color] duration-300 ${
        pastHero
          ? "bg-[rgba(252,252,251,0.82)] backdrop-blur-[18px] backdrop-saturate-[1.25]"
          : "bg-[#c5ebfd]"
      }`}
    >
      {children}
    </header>
  );
}
