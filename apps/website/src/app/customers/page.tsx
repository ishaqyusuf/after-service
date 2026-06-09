import type { Metadata } from "next";
import { createPageMetadata } from "../../lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Customer history | afterservice",
    description:
      "Keep service customers, completed jobs, follow-up history, notes, and manual outreach logs in one workspace.",
    path: "/customers",
  });
}

export default async function CustomersPage() {
  return (
    <main className="site-page">
      <span className="site-kicker">Customer operations</span>
      <h1>Keep every service customer ready for the next follow-up.</h1>
      <p>
        afterservice gives operators one workspace for customer records,
        completed jobs, follow-up history, notes, and manual outreach logs.
      </p>
      <p>
        Customer data stays tied to the operator workspace, so every job,
        template, timeline event, and billing limit uses the same scoped source
        of truth.
      </p>
      <a href="/signup">Start setup</a>
    </main>
  );
}
