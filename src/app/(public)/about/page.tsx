import type { Metadata } from "next";
import { InfoPage } from "@/components/site/InfoPage";

export const metadata: Metadata = {
  title: "About Naano | Naano",
  description: "Naano is a B2B creator marketplace: companies book vetted LinkedIn creators at a fixed price per post and trace the pipeline back to each one.",
};

export default function Page() {
  return (
    <InfoPage
      eyebrow="Company"
      title="About Naano."
      lead="Naano is a B2B creator marketplace: companies book vetted LinkedIn creators at a fixed price per post and trace the pipeline back to each one."
    >
          <section>
            <h2>What we do</h2>
            <p>Brands describe a campaign, shortlist creators whose audience overlaps their buyer, agree a flat fee per post, and track every click, lead and opportunity back to the creator who produced it.</p>
          </section>
          <section>
            <h2>Who it is for</h2>
            <p>B2B teams whose buyers are already on LinkedIn and who would rather borrow a practitioner&rsquo;s trust than buy another impression.</p>
          </section>
          <section>
            <h2>About this build</h2>
            <p>This site is a rebuild of naano.com made as a take-home exercise. It is not affiliated with Naano, and the creators shown inside the product are invented.</p>
          </section>
    </InfoPage>
  );
}
