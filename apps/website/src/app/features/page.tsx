import type { Metadata } from "next";
import { createPageMetadata } from "../../lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Features | afterservice",
    description:
      "Follow-up workflows for completed jobs, customer check-ins, templates, and manual outreach logs.",
    path: "/features",
  });
}

export default async function FeaturesPage() {
  return (
    <main className="site-page">
      <span className="site-kicker">Features</span>
      <h1>Follow-up workflows for the work that already happened.</h1>
      <p>
        Manage customers, log completed service jobs, create follow-ups, use
        saved templates, move work through a board, and record manual outreach
        from one operator dashboard.
      </p>
      <p>
        Billing, plan limits, and webhook-confirmed entitlements are built into
        the MVP foundation, while automated outbound messaging remains off until
        providers are explicitly configured.
      </p>
      <a href="/signup">Start setup</a>
    </main>
  );
}
