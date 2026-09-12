import Link from "next/link";
import { LocaleButton } from "./parts";
import { CreatorSignup } from "./CreatorSignup";
import { BrandSignup } from "./BrandSignup";

/**
 * /register — naano's sign-up entry.
 *
 * Three states, all on the same URL, exactly as theirs:
 *   /register                     the role chooser
 *   /register?role=influencer     the creator flow (step 1 of 4)
 *   /register?role=saas           the brand flow
 *
 * The role is a query parameter rather than a route so the choice can be
 * linked to directly from the marketing pages, which is what their CTAs do.
 */

export const metadata = { title: "Create your account — Naano" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; error?: string; provider?: string }>;
}) {
  const { role, error, provider } = await searchParams;

  if (role === "influencer" || role === "creator") {
    return <CreatorSignup error={error} provider={provider} />;
  }
  if (role === "saas" || role === "brand") {
    return <BrandSignup error={error} provider={provider} />;
  }

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div className="flex flex-1 items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="naano" className="h-7 w-auto object-contain" />
            <LocaleButton />
          </div>

          <h1 className="text-2xl font-bold text-[#111827]">Create your account</h1>
          <p className="mb-6 mt-1 text-sm text-[#6B7280]">First, who are you here as?</p>

          <div className="space-y-3">
            <Link
              href="/register?role=influencer"
              className="block rounded-[14px] border border-[#D1D5DB] p-5 transition-colors hover:border-[#2563eb] hover:bg-[#F5F8FF]"
            >
              <div className="text-base font-semibold text-[#111827]">I&apos;m a creator</div>
              <p className="mt-1 text-sm text-[#6B7280]">
                Get paid to create LinkedIn content for B2B brands you actually use.
              </p>
            </Link>
            <Link
              href="/register?role=saas"
              className="block rounded-[14px] border border-[#D1D5DB] p-5 transition-colors hover:border-[#2563eb] hover:bg-[#F5F8FF]"
            >
              <div className="text-base font-semibold text-[#111827]">I&apos;m a brand</div>
              <p className="mt-1 text-sm text-[#6B7280]">
                Find creators, launch campaigns, and trace real pipeline back to each post.
              </p>
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-[#6B7280]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#2563eb]">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center p-12 text-white lg:flex" style={{ background: "#2563eb" }}>
        <div className="max-w-sm">
          <h2 className="mb-4 text-3xl font-bold">One platform. Two sides.</h2>
          <p className="text-[#DBEAFE]">
            Creators get paid to post. B2B brands get real pipeline. Pick where you fit
            and we&apos;ll set the rest up in a couple of minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
