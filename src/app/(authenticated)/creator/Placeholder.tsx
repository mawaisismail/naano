import Link from "next/link";

/**
 * A named destination for the sidebar entries this build has not filled in.
 * Saying so on the page is better than a link that 404s, and better than a
 * fake screen that implies work that does not exist.
 */
export function Placeholder({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="mx-auto max-w-[1340px]">
      <h1 className="pb-2 pt-2 text-[36px] font-bold tracking-[-0.02em] text-[#111827]">{title}</h1>
      <p className="text-sm text-[#6B7280]">{blurb}</p>
      <div className="mt-8 rounded-[18px] border border-dashed border-[#D7DCE5] bg-white p-10 text-center">
        <p className="text-sm font-semibold text-[#111827]">Not built in this rebuild</p>
        <p className="mx-auto mt-2 max-w-[520px] text-sm leading-6 text-[#6B7280]">
          The sign-up, onboarding and analytics surfaces are the ones this
          exercise reproduces. This screen exists so the navigation matches
          naano&apos;s without pretending to hold data it does not have.
        </p>
        <Link
          href="/creator/analytics"
          className="mt-6 inline-flex rounded-[10px] bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back to Analytics
        </Link>
      </div>
    </div>
  );
}
