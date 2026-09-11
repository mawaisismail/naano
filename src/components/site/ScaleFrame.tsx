"use client";

import { useEffect, useRef } from "react";

export const DESIGN_WIDTH = 1672;

/**
 * naano's landing page is authored at a fixed 1672px and scaled to the
 * viewport with CSS zoom — at 1440 the wrapper carries zoom 0.861244, at 2000
 * it carries 1.19617, and 1672 x zoom always equals the viewport width.
 *
 * That is why measuring their pixels against ours never lined up: their
 * getBoundingClientRect values are post-zoom while ours were not. Reproducing
 * the frame means every authored value below can be taken from their
 * stylesheet directly, and the whole page scales the way theirs does.
 *
 * Only applied from 1024px up. Below that naano serves a normal responsive
 * layout, and zooming a phone down to 23% would be unreadable.
 */
export function ScaleFrame({
  children,
  maxZoom,
}: {
  children: React.ReactNode;
  /**
   * naano caps /agencies at zoom 1: past 1672 the frame stops growing and
   * centres, so the page shows either side of it. Their landing and /creators
   * pages have no cap and keep scaling — 1.5311 at 2560 — so this is opt-in.
   */
  maxZoom?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = () => {
      const vw = document.documentElement.clientWidth;
      if (vw >= 1024) {
        const raw = vw / DESIGN_WIDTH;
        const zoom = maxZoom ? Math.min(raw, maxZoom) : raw;
        el.style.width = `${DESIGN_WIDTH}px`;
        // Once capped the frame no longer fills the window, so centre it the
        // way theirs is (margin: 0 264px at 2200).
        el.style.marginInline = zoom < raw ? "auto" : "";
        // `zoom` takes a unitless factor; it cannot be expressed as a CSS calc
        // over 100vw, which is why naano sets it from script too.
        el.style.zoom = String(zoom);
        // Anything sized in vh inside the frame is scaled by the zoom as well,
        // so 100vh renders as 100vh * zoom. Publish the factor and divide it
        // back out where a block needs to be a real viewport tall.
        el.style.setProperty("--nn-zoom", String(zoom));
      } else {
        el.style.width = "100%";
        el.style.zoom = "1";
        el.style.marginInline = "";
        el.style.setProperty("--nn-zoom", "1");
      }
    };

    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [maxZoom]);

  // Rendered at the design width for the server pass so the first paint is not
  // a full-width flash before the effect runs.
  return (
    <div ref={ref} className="nn-scale-frame origin-top">
      {children}
    </div>
  );
}
