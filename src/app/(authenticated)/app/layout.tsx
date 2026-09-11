import { redirect } from "next/navigation";
import { Sidebar } from "@/components/app/Sidebar";
import { getCurrentUser } from "@/lib/session";
import { logout } from "@/lib/actions/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Signed in already, guaranteed by (authenticated)/layout.tsx; this call is
  // deduped with that one by React cache, so it costs no extra query.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // The only rule left for this section: a creator who lands here belongs on
  // their own side of the marketplace.
  if (user.role !== "brand") redirect("/studio");

  return (
    <div className="flex min-h-screen bg-[#fbfcff]">
      <Sidebar
        user={{ name: user.name, company: user.companyName ?? "Brand" }}
        logout={logout}
      />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
