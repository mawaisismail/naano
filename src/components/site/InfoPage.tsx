import type { ReactNode } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ScaleFrame } from "@/components/site/ScaleFrame";

/**
 * The shared shell for naano's smaller footer pages (about, help, privacy,
 * terms, reports). Same chrome and rhythm as the marketing pages, one column.
 */
export function InfoPage({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <ScaleFrame>
      <Nav tone="paper" />
      <main className="bg-[#fcfcfb] px-5 pb-24 pt-[144px] lg:px-[84px]">
        <div className="mx-auto max-w-[760px]">
          <div className="text-[12px] font-bold uppercase leading-[15px] tracking-[1.92px] text-[#315b7c]">
            {eyebrow}
          </div>
          <h1 className="mt-6 text-[36px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#111318] lg:text-[52px]">
            {title}
          </h1>
          <p className="mt-6 text-[19px] leading-[30px] text-[#55575e]">{lead}</p>
          <div className="mt-12 space-y-9 text-[16px] leading-[26px] text-[#43454c] [&_h2]:text-[20px] [&_h2]:font-bold [&_h2]:leading-7 [&_h2]:text-[#17181c] [&_p]:mt-2.5">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </ScaleFrame>
  );
}
