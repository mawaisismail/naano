import { redirect } from "next/navigation";
import { Sidebar } from "@/components/app/Sidebar";
import { getCurrentUser } from "@/lib/session";
import { logout } from "@/app/login/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // The brand app is behind auth. A creator who lands here goes to their own side.
  if (!user) redirect("/login?next=/app");
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
