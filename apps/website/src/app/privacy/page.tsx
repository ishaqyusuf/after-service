import { appMetadata } from "@afterservice/utils";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Privacy Policy | After Service",
    description: "Our privacy policy.",
  };
}

export default async function PrivacyPage() {
  return (
    <main className="site-page">
      <span className="site-kicker">Legal</span>
      <h1>Privacy policy</h1>
      <p>
        afterservice stores operator account, workspace, customer, service job,
        follow-up, message log, and billing data so teams can run after-service
        workflows. Customer communication is manual-send in the MVP.
      </p>
      <p>
        Production deployments should configure database access, auth secrets,
        Lemon Squeezy webhooks, and observability before collecting live
        customer data.
      </p>
      <a href="/signup">Start setup</a>
      <p className="site-note">
        This placeholder is for MVP readiness and should be reviewed by counsel
        before public launch of {appMetadata.name}.
      </p>
    </main>
  );
}
