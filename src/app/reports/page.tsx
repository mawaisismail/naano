import type { Metadata } from "next";
import { InfoPage } from "@/components/site/InfoPage";

export const metadata: Metadata = {
  title: "Reports & benchmarks | Naano",
  description: "What B2B teams actually pay for creator posts, and what those posts return.",
};

export default function Page() {
  return (
    <InfoPage
      eyebrow="Data"
      title="Reports & benchmarks."
      lead="What B2B teams actually pay for creator posts, and what those posts return."
    >
          <section>
            <h2>Sponsored post price index</h2>
            <p>Median transacted price per post by follower band, refreshed from real bookings rather than rate cards.</p>
          </section>
          <section>
            <h2>Delivery odds</h2>
            <p>How often a booking at a given price ends in a published post, and how often it goes unanswered.</p>
          </section>
          <section>
            <h2>Cost per lead</h2>
            <p>Creator-led cost per lead against paid social benchmarks, measured on the same attribution window.</p>
          </section>
          <section>
            <h2>About this page</h2>
            <p>The underlying datasets are Naano&rsquo;s. This rebuild reproduces the navigation, not their numbers.</p>
          </section>
    </InfoPage>
  );
}
