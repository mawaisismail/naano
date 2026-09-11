import Link from "next/link";
import { DocsNav } from "@/components/site/DocsNav";
import { DocsFooter } from "@/components/site/DocsFooter";
import { TOOLS, type Tool } from "@/lib/tools";

/**
 * The frame every /free-tools/<slug> page sits in, authored from naano's tool
 * pages (measured on their engagement-rate calculator at 1440, doc 6180):
 *
 *   hero      section pt-28 pb-10 / sm:pt-36 pb-12 over a
 *             radial-gradient(640px 320px at 50% -120px, rgba(22,82,240,.08))
 *             back pill  min-h-40, px 16 py 8, 1px #E4E1DC on white, 13/500
 *             h1         56 / 58.8 / 600 / -0.04em with a blue full stop
 *             lead       19 / 30.875 / #55575E, max-w-680, centred
 *   tool      section pt-6 pb-16 sm:pb-20, inner max-w-820,
 *             card radius 18, 1px #ECEAE6, p 32, shadow 0 18 44 rgba(23,24,28,.08)
 *   sections  border-t #ECEAE6, py 80, inner max-w-820
 *             h2 38 / 45.6 / 600, body 16 / 26.4
 *   related   inner max-w-1100, h2 30 / 36 / 600, three cards p 24 radius 18,
 *             icon 40 radius 14 #E8F0FE/#1652F0, h3 17/23.375/600, p 14/22.75
 *   cta       two cards, dark #17181C and white, p 32 radius 18,
 *             h2 24 / 32 / 600, body 16 / 26, button min-h-44 radius 14
 */

export function ToolPage({
  tool,
  h1,
  lead,
  children,
  sections,
  cta,
}: {
  tool: Tool;
  /** naano's h1 is the tool name, not the card title, on two of the five. */
  h1?: string;
  lead: string;
  /** The calculator itself — a client component. */
  children: React.ReactNode;
  sections: React.ReactNode;
  cta: { darkTitle: string; darkBody: string; darkCta: [string, string]; lightTitle: string; lightBody: string; lightCta: [string, string] };
}) {
  const related = TOOLS.filter((t) => t.slug !== tool.slug).slice(0, 2);

  return (
    <div className="nn-doc bg-white">
      <DocsNav />

      <section className="relative overflow-hidden pb-10 pt-28 sm:pb-12 sm:pt-36">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(640px 320px at 50% -120px, rgba(22,82,240,0.08), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[900px] px-4 text-center sm:px-6">
          <Link
            href="/free-tools"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#E4E1DC] bg-white px-4 py-2 text-[13px] font-medium text-[#55575E] shadow-[0_1px_2px_rgba(23,24,28,0.04)] transition-colors duration-200 hover:border-[#D8D4CE] hover:text-[#17181C]"
          >
            <svg viewBox="0 0 24 24" className="size-[14px] text-[#1652F0]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
            Free Tools
          </Link>
          <h1 className="mt-8 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#17181C] sm:text-5xl lg:text-[56px]">
            {h1 ?? tool.title}
            <span className="text-[#1652F0]">.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[680px] text-lg leading-relaxed text-[#55575E] sm:text-[19px]">
            {lead}
          </p>
        </div>
      </section>

      <section className="pb-16 pt-6 sm:pb-20">
        <div className="mx-auto max-w-[820px] px-4 sm:px-6">
          <div className="rounded-[18px] border border-[#ECEAE6] bg-white p-6 shadow-[0_18px_44px_rgba(23,24,28,0.08)] sm:p-8">
            {children}
          </div>
        </div>
      </section>

      {sections}

      {/* --------------------------------------------------------- related */}
      <section className="border-t border-[#ECEAE6] py-16 sm:py-20">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181C] sm:text-3xl">
            More free tools
            <span className="text-[#1652F0]">.</span>
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => (
              <RelatedCard
                key={t.slug}
                href={`/free-tools/${t.slug}`}
                title={t.title}
                body={`${t.lead}.`}
              />
            ))}
            <RelatedCard
              href="/free-tools"
              title="All free tools"
              body="Every free Naano tool for B2B creator marketing, in one place."
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- cta */}
      <section className="border-t border-[#ECEAE6] py-16 sm:py-20">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col rounded-[18px] bg-[#17181C] p-8 text-white shadow-[0_18px_44px_rgba(23,24,28,0.18)]">
              <h2 className="text-2xl font-semibold tracking-[-0.02em]">{cta.darkTitle}</h2>
              <p className="mt-3 flex-1 text-[16px] leading-relaxed text-white/80">{cta.darkBody}</p>
              <Link
                href={cta.darkCta[1]}
                className="mt-6 inline-flex min-h-11 items-center gap-2 self-start rounded-[14px] bg-white px-6 py-3 text-[15px] font-semibold text-[#17181C] transition-opacity duration-200 hover:opacity-90"
              >
                {cta.darkCta[0]}
                <Arrow />
              </Link>
            </div>
            <div className="flex flex-col rounded-[18px] border border-[#ECEAE6] bg-white p-8 shadow-[0_2px_10px_rgba(23,24,28,0.05)]">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#17181C]">
                {cta.lightTitle}
              </h2>
              <p className="mt-3 flex-1 text-[16px] leading-relaxed text-[#55575E]">{cta.lightBody}</p>
              <Link
                href={cta.lightCta[1]}
                className="mt-6 inline-flex min-h-11 items-center gap-2 self-start rounded-[14px] bg-[#1652F0] px-6 py-3 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#1240D0]"
              >
                {cta.lightCta[0]}
                <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <DocsFooter />
    </div>
  );
}

function RelatedCard({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-[18px] border border-[#ECEAE6] bg-white p-6 transition-colors duration-150 hover:border-[#D8D5CF]"
    >
      <span className="flex size-10 items-center justify-center rounded-[14px] bg-[#E8F0FE] text-[#1652F0]">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01" />
        </svg>
      </span>
      <h3 className="mt-4 text-[17px] font-semibold leading-[1.375] text-[#17181C]">{title}</h3>
      <p className="mt-1.5 flex-1 text-[14px] leading-[1.625] text-[#55575E]">{body}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-[#17181C] transition-colors group-hover:text-[#1652F0]">
        Open
        <Arrow className="size-[14px]" />
      </span>
    </Link>
  );
}

function Arrow({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/* ------------------------------------------------------------- sections -- */

export function ToolSection({
  title,
  lead,
  children,
  wide,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section className="border-t border-[#ECEAE6] py-16 sm:py-20">
      <div className={`mx-auto px-4 sm:px-6 ${wide ? "max-w-[1100px]" : "max-w-[820px]"}`}>
        <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#17181C] sm:text-[38px]">
          {title}
        </h2>
        {lead ? (
          <p className="mt-4 text-[16px] leading-[1.65] text-[#55575E]">{lead}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function ToolFaq({ items }: { items: [string, string][] }) {
  return (
    <section className="border-t border-[#ECEAE6] py-16 sm:py-20">
      <div className="mx-auto max-w-[820px] px-4 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#17181C] sm:text-[38px]">
          Frequently asked questions
          <span className="text-[#1652F0]">.</span>
        </h2>
        <div className="mt-8">
          {items.map(([q, a]) => (
            <div key={q} className="border-t border-[#ECEAE6] py-7 first:pt-2">
              <h3 className="text-[18px] font-medium tracking-[-0.015em] text-[#17181C]">{q}</h3>
              <p className="mt-3 max-w-[680px] text-[16px] leading-[1.65] text-[#6B6D74]">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Formula({ title, code, body }: { title: string; code: string; body: string }) {
  return (
    <div>
      <h3 className="text-[18px] font-semibold tracking-[-0.015em] text-[#17181C]">{title}</h3>
      <div className="mt-3 overflow-x-auto rounded-[14px] border border-[#ECEAE6] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(23,24,28,0.03)]">
        <code className="whitespace-nowrap text-[15px] font-semibold text-[#1652F0]">{code}</code>
      </div>
      <p className="mt-3 text-[16px] leading-[1.65] text-[#6B6D74]">{body}</p>
    </div>
  );
}

export function ToolTable({
  head,
  rows,
}: {
  head: [string, string, string];
  rows: [string, string, string][];
}) {
  return (
    <div className="mt-8 overflow-x-auto rounded-[18px] border border-[#ECEAE6] bg-white">
      <table className="w-full min-w-[560px] text-left text-[15px]">
        <thead>
          <tr className="border-b border-[#ECEAE6] bg-[#FAFAF9]">
            {head.map((h) => (
              <th key={h} scope="col" className="px-5 py-3.5 font-semibold text-[#17181C]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-b border-[#ECEAE6] last:border-b-0">
              <td className="px-5 py-4 font-semibold text-[#17181C]">{r[0]}</td>
              <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#1652F0]">{r[1]}</td>
              <td className="px-5 py-4 leading-relaxed text-[#55575E]">{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
