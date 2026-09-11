import { Suspense } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { MarketplaceClient } from "@/components/MarketplaceClient";
import { allCreators } from "@/lib/creator-profile";

export const metadata = {
  title: "Marketplace — Naano",
  description:
    "Browse vetted B2B LinkedIn creators by vertical, audience size, price and country.",
};

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  // seeded creators plus everyone who finished onboarding
  const creators = await allCreators();
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#fbfcff] pt-[73px]">
        {/* useSearchParams needs a Suspense boundary so the shell can still
            stream while the filtered grid resolves. */}
        <Suspense
          fallback={
            <div className="mx-auto max-w-7xl px-5 py-10">
              <div className="h-8 w-48 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 animate-pulse rounded-2xl bg-surface motion-reduce:animate-none"
                  />
                ))}
              </div>
            </div>
          }
        >
          <MarketplaceClient creators={creators} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
