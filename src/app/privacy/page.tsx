import type { Metadata } from "next";
import { InfoPage } from "@/components/site/InfoPage";

export const metadata: Metadata = {
  title: "Privacy | Naano",
  description: "What this build stores, why, and for how long.",
};

export default function Page() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy."
      lead="What this build stores, why, and for how long."
    >
          <section>
            <h2>What is collected</h2>
            <p>An account holds an email address, a display name and a role. Campaign records hold the posts you book and the links generated for them.</p>
          </section>
          <section>
            <h2>Click tracking</h2>
            <p>Tracked links record a timestamp, a coarse referrer and a one-way hash of the visitor&rsquo;s IP address. Raw IP addresses are never written to the database; the hash exists only to stop one visitor inflating a creator&rsquo;s click count.</p>
          </section>
          <section>
            <h2>Retention and contact</h2>
            <p>Data lives as long as the account does and is removed with it. This rebuild is a take-home exercise and is not operated by Naano.</p>
          </section>
    </InfoPage>
  );
}
