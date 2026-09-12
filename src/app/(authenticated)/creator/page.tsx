import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { DemoDataBanner } from "./DemoDataBanner";

/** /creator — the workspace landing screen. */
export default async function CreatorOverview() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const incomplete = !user.invoiceMandateAcceptedAt;

  return (
    <div className="mx-auto max-w-[1340px]">
      <h1 className="pb-2 pt-2 text-[36px] font-bold tracking-[-0.02em] text-[#111827]">
        Welcome back, {user.name.split(" ")[0]}
      </h1>
      <p className="text-sm text-[#6B7280]">
        Your card is live in the marketplace. Here is where it stands.
      </p>

      <div className="mt-8">
        <DemoDataBanner source={user.profileDataSource} />
      </div>

      {incomplete ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[#E0E7FF] bg-[#F5F8FF] p-6">
          <div>
            <p className="text-sm font-semibold text-[#111827]">
              Finish your professional information
            </p>
            <p className="mt-1 text-sm text-[#4B5563]">
              Required before invoicing or withdrawing earnings — not before
              being booked.
            </p>
          </div>
          <Link href="/register?role=professional" className="rounded-[10px] bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white">
            Complete it now
          </Link>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="LinkedIn followers" value={(user.followers ?? 0).toLocaleString("en-GB")} />
        <Tile label="Price per post" value={user.postCost ? `€${user.postCost}` : "—"} />
        <Tile label="Industries" value={user.industries.length ? user.industries.join(" · ") : "—"} />
        <Tile label="Marketplace card" value={user.onboardedAt ? "Live" : "Draft"} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel
          title="Your public card"
          body="This is the card brands see when they search the marketplace."
          href={user.creatorSlug ? `/creators/${user.creatorSlug}` : "/creator/card"}
          cta="View my card"
        />
        <Panel
          title="Analytics"
          body="Public LinkedIn performance imported for this profile."
          href="/creator/analytics"
          cta="Open analytics"
        />
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-6">
      <div className="text-sm text-[#6B7280]">{label}</div>
      <div className="mt-3 truncate text-[22px] font-bold tracking-[-0.02em] text-[#111827]">
        {value}
      </div>
    </div>
  );
}

function Panel({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-6">
      <h2 className="text-lg font-bold text-[#111827]">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-[#6B7280]">{body}</p>
      <Link href={href} className="mt-5 inline-flex rounded-[10px] border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:border-[#9CA3AF]">
        {cta}
      </Link>
    </section>
  );
}
