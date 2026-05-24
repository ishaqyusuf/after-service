import { PageShell } from "@/lib/page-shell";

export default function BillingPage() {
  return (
    <PageShell
      actionHref="/settings"
      actionLabel="View settings"
      description="Subscription status, plan limits, and checkout actions will connect here."
      title="Billing"
    />
  );
}
