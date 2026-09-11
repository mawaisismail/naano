import type { Metadata } from "next";
import { InfoPage } from "@/components/site/InfoPage";

export const metadata: Metadata = {
  title: "Terms of Sale & Use | Naano",
  description: "The terms that would apply to booking creators and publishing sponsored posts.",
};

export default function Page() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms of Sale & Use."
      lead="The terms that would apply to booking creators and publishing sponsored posts."
    >
          <section>
            <h2>Bookings</h2>
            <p>A booking becomes binding when a creator accepts it. The fee is the flat rate shown at the time of booking; campaign spend is separate from any platform plan.</p>
          </section>
          <section>
            <h2>Publishing</h2>
            <p>Creators write in their own voice. A brief may set an angle, a hook and a call to action, but editorial control stays with the creator, and disclosure follows the platform&rsquo;s rules.</p>
          </section>
          <section>
            <h2>Cancellation</h2>
            <p>Plans are month to month with no lock-in. A booking can be cancelled before a creator accepts it; once accepted, the agreed fee is due on publication.</p>
          </section>
          <section>
            <h2>This build</h2>
            <p>These terms describe the product being cloned. This rebuild is a take-home exercise and sells nothing.</p>
          </section>
    </InfoPage>
  );
}
