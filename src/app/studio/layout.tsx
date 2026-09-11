import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { logout } from "@/app/login/actions";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/studio");
  if (user.role !== "creator") redirect("/app");

  return (
    <div className="min-h-screen bg-[#fbfcff]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-xl font-extrabold tracking-tight text-ink">
              naano<span className="text-brand">.</span>
            </Link>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
              Creator studio
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-semibold text-ink sm:inline">{user.name}</span>
            <form action={logout}>
              <button className="text-sm font-medium text-muted transition hover:text-ink">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
