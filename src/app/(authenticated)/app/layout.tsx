import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { AccountMenu } from "@/components/app/AccountMenu";
import { BrandSidebar } from "./BrandSidebar";
import { GetStarted } from "./GetStarted";

/**
 * The brand workspace shell, authored from naano's /app screens.
 *
 * It reads as a sibling of the creator workspace rather than a copy: the rail,
 * the 72px header and the #FBFCFF canvas are shared, and the brand-only pieces
 * are the company switcher, the real wallet balance in the header pill, and
 * the GET STARTED checklist that naano shows a brand until it has launched.
 *
 * Authentication is already guaranteed by (authenticated)/layout.tsx; the only
 * rule added here is the role one, so a creator cannot open the brand
 * workspace by typing the URL.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "brand") redirect("/creator");

  // A brand that has not finished the 3-step wizard has no value prop and no
  // ICPs, so every screen below would be empty. Send them back to finish.
  if (!user.brandOnboardedAt) redirect("/register?role=saas");

  const company = user.companyName ?? "Brand";

  // The checklist is derived, never stored: a step is done because the row
  // exists, so it cannot go stale against the data it describes.
  const [campaigns, deals] = await Promise.all([
    prisma.campaign.count({ where: { brandId: user.id } }),
    prisma.deal.count({ where: { campaign: { brandId: user.id } } }),
  ]);
  const steps = [
    { label: "Add your website", href: "/register?role=saas&step=1", done: Boolean(user.websiteUrl) },
    { label: "Confirm your ICPs", href: "/app/creators", done: user.icps.length > 0 },
    { label: "Create a campaign", href: "/app/campaigns/new", done: campaigns > 0 },
    { label: "Add budget", href: "/app/billing", done: user.walletBalance > 0 },
    { label: "Book your first creator", href: "/app/creators", done: deals > 0 },
  ];

  return (
    <div className="flex min-h-screen bg-[#FBFCFF]">
      <BrandSidebar company={company} />

      <div className="min-w-0 flex-1">
        <header className="flex h-[72px] items-center justify-end gap-3 px-6">
          <span className="inline-flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm font-medium text-[#111827]">
            <svg viewBox="0 0 24 24" className="size-4 text-[#6B7280]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <rect x="2" y="6" width="20" height="13" rx="2.5" />
              <path d="M2 10h20" />
            </svg>
            €{user.walletBalance.toLocaleString("en-GB")}
          </span>

          <GetStarted steps={steps} />

          <span className="inline-flex overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white text-xs font-semibold">
            <span className="bg-[#F3F4F6] px-2.5 py-2 text-[#111827]">EN</span>
            <span className="px-2.5 py-2 text-[#9CA3AF]">FR</span>
          </span>

          <button type="button" aria-label="Notifications" className="grid size-9 place-items-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:text-[#111827]">
            <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
          </button>

          <AccountMenu
            name={user.name}
            email={user.email}
            avatarUrl={user.avatarUrl}
            items={[
              { href: "/app/billing", label: "Billing and budget", icon: "billing" },
              { href: "/app/creators", label: "Company and ICPs", icon: "company" },
              { href: "/register?role=saas&step=1", label: "Workspace settings", icon: "settings" },
            ]}
          />
        </header>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
