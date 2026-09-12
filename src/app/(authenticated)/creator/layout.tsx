import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { CreatorSidebar } from "./CreatorSidebar";
import { AccountMenu } from "./AccountMenu";

/**
 * The creator workspace shell, authored from naano's /creator screen.
 *
 *   sidebar  278 wide, white, 1px right rule #ECECEA; brand row 24 mark plus
 *            "naano" 20/700; items 14/500 #4B5563, active #2563eb on #F5F8FF
 *   topbar   right-aligned: wallet pill, EN/FR switch, bell, avatar with a
 *            green presence dot
 *   canvas   #FBFCFF
 *
 * Authentication is already guaranteed by (authenticated)/layout.tsx; the only
 * rule added here is the role one, so a brand cannot open the creator
 * workspace by typing the URL.
 */
export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "creator") redirect("/app");

  // A creator who has not created their card yet has nothing to look at here.
  if (!user.onboardedAt) redirect("/register?role=influencer");

  return (
    <div className="flex min-h-screen bg-[#FBFCFF]">
      <CreatorSidebar />

      <div className="min-w-0 flex-1">
        <header className="flex h-[72px] items-center justify-end gap-3 px-6">
          <span className="inline-flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm font-medium text-[#111827]">
            <svg viewBox="0 0 24 24" className="size-4 text-[#6B7280]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <rect x="2" y="6" width="20" height="13" rx="2.5" />
              <path d="M2 10h20" />
            </svg>
            €0
          </span>

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
            creatorSlug={user.creatorSlug}
            needsProfessionalInfo={!user.invoiceMandateAcceptedAt}
          />
        </header>

        <main className="px-8 pb-16">{children}</main>
      </div>
    </div>
  );
}
