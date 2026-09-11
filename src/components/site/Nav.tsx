import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { ResourcesMenu } from "./ResourcesMenu";
import { RESOURCES } from "@/lib/nav-links";
import { logout } from "@/lib/actions/auth";
import { MobileMenu } from "./MobileMenu";
import { NavShell } from "./NavShell";

export function Wordmark({ className = "" }: { className?: string }) {
  // naano's nav wordmark is a single image containing both the mark and the
  // lettering: 143 x 30 at rest, 124 x 26 once the bar shrinks.
  return (
    <Link
      href="/"
      className={`flex items-center ${className}`}
      aria-label="naano — home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/lp/naano-logo-nav.png"
        alt="naano"
        width={143}
        height={30}
        className="h-[26px] w-[124px] object-contain transition-[height,width] duration-300 lg:h-[30px] lg:w-[143px] lg:group-data-[scrolled=true]/nav:h-[26px] lg:group-data-[scrolled=true]/nav:w-[124px]"
      />
    </Link>
  );
}

/** naano's own routes: companies is the landing page itself. "How it works"
 *  is deliberately not here — removed deliberately: it is not in naano's own nav. */
const LINKS = [
  ["For companies", "/"],
  ["For creators", "/creators"],
  ["For agencies", "/agencies"],
] as const;

/**
 * Site header, measured against naano's at 1440:
 *   Authored at naano's 1672px design width (see ScaleFrame), so these are
 *   their values verbatim rather than anything derived:
 *     56px gutters · 73px tall · transparent over the hero photo
 *     wordmark 143 x 30
 *     link row and actions are ONE right-hand group; the links are not centred
 *     link gaps 32px · Sign in 87x41 · Sign up 95x41
 */
export async function Nav({
  tone = "sky",
  cta,
}: {
  tone?: "sky" | "paper";
  /** naano relabels the last button per page: Sign up on the landing page,
   *  Start earning on /creators, Choose your agency on /agencies. */
  cta?: { label: string; href: string };
} = {}) {
  const user = await getCurrentUser();
  const action = cta ?? { label: "Sign up", href: "/register" };
  const home = user?.role === "creator" ? "/studio" : "/app";
  const homeLabel = user?.role === "creator" ? "Creator studio" : "Dashboard";

  return (
    <NavShell tone={tone}>
      {/* Full-bleed: naano has no max-width here. Their gutter is 3.35% of
          the viewport — 48px at 1440, 67px at 2000 — so it scales with the
          screen instead of the bar collapsing into a centred column. */}
      <div className="flex h-[65px] w-full items-center justify-between px-5 py-3 transition-[height,padding] duration-300 lg:h-[73px] lg:px-[56px] lg:py-4 lg:group-data-[scrolled=true]/nav:h-[61px] lg:group-data-[scrolled=true]/nav:py-[10px]">
        <Wordmark />

        <div className="flex items-center gap-3 lg:gap-[62px]">
          <nav className="hidden items-center gap-[32px] lg:flex">
            {LINKS.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="inline-flex items-center gap-1 whitespace-nowrap text-[15px] font-medium leading-none text-[#17181c] transition hover:opacity-70"
              >
                {label}
              </Link>
            ))}
            <ResourcesMenu />
          </nav>

          <div className="flex items-center gap-[20px]">
            <span
              title="English — this rebuild is English only"
              className="hidden items-center gap-1 text-[15px] font-medium leading-none text-[#17181c] lg:inline-flex"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-[15px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.6 2.5 15 0 18M12 3c-2.5 2.6-2.5 15 0 18" />
              </svg>
              EN
            </span>

            <MobileMenu
              links={[...LINKS, ...RESOURCES]}
              signedIn={!!user}
              home={home}
              homeLabel={homeLabel}
            />

            {user ? (
              <div className="flex items-center gap-[10px]">
                <Link
                  href={home}
                  className="whitespace-nowrap rounded-full bg-[#17181c] px-4 py-2.5 text-[14px] font-semibold leading-none text-white transition hover:opacity-90 lg:px-[20px] lg:py-[13px] lg:text-[15px]"
                >
                  {homeLabel}
                </Link>
                <form action={logout} className="hidden sm:block">
                  <button className="px-1 text-[15px] font-medium text-[#787774] transition hover:text-[#17181c]">
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-[10px]">
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-full border border-[#e8e6e2] bg-white px-3.5 py-2.5 text-[14px] font-semibold leading-none text-[#17181c] transition hover:border-[#d5d3ce] lg:px-[18px] lg:py-[12px] lg:text-[15px]"
                >
                  Sign in
                </Link>
                <Link
                  href={action.href}
                  className="whitespace-nowrap rounded-full bg-[#17181c] px-4 py-2.5 text-[14px] font-semibold leading-none text-white transition hover:opacity-90 lg:px-[20px] lg:py-[13px] lg:text-[15px]"
                >
                  {action.label}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </NavShell>
  );
}
