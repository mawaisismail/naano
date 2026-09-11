import type { Metadata } from "next";
import { InfoPage } from "@/components/site/InfoPage";

export const metadata: Metadata = {
  title: "Help Center | Naano",
  description: "How to get moving on Naano, and where to ask when something is not working.",
};

export default function Page() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Help Center."
      lead="How to get moving on Naano, and where to ask when something is not working."
    >
          <section>
            <h2>Getting started</h2>
            <p>Create an account, tell us what you sell and who you sell to, and browse the marketplace. Booking a first post takes a few minutes and costs nothing until a creator accepts.</p>
          </section>
          <section>
            <h2>For creators</h2>
            <p>Set your own flat rate per post, accept only the deals you want, and get paid once the post is live. No exclusivity and no minimum.</p>
          </section>
          <section>
            <h2>Contact</h2>
            <p>Questions about a campaign, a payout or an invoice go to the team through the in-app messages, or book a call and we will walk through it with you.</p>
          </section>
    </InfoPage>
  );
}
