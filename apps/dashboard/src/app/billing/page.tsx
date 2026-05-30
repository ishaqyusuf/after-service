import { Badge, Button } from "@afterservice/ui";
import { startCheckoutAction } from "@/lib/dashboard-actions";
import { formatDate, getBillingData } from "@/lib/dashboard-data";

export default async function BillingPage() {
  const { limits, plan, planStatus, subscription, usage } =
    await getBillingData();

  return (
    <main className="dashboard-page">
      <header className="dashboard-page__header">
        <Badge tone={planStatus === "active" ? "success" : "warning"}>
          {planStatus}
        </Badge>
        <div>
          <h1>Billing</h1>
          <p>
            Subscription state is persisted from verified Lemon Squeezy
            webhooks. Checkout can start here, but redirects do not grant
            entitlement.
          </p>
        </div>
        <form action={startCheckoutAction}>
          <Button type="submit">Start checkout</Button>
        </form>
      </header>

      <section className="metric-grid">
        <Metric label="Plan" value={plan} />
        <Metric
          label="Customers"
          value={`${usage.customers}/${limits.customers}`}
        />
        <Metric
          label="Follow-ups"
          value={`${usage.followUps}/${limits.followUps}`}
        />
        <Metric
          label="Templates"
          value={`${usage.templates}/${limits.templates}`}
        />
      </section>

      <section className="dashboard-section">
        <h2>Subscription</h2>
        <dl className="detail-list">
          <div>
            <dt>Provider subscription</dt>
            <dd>
              {subscription?.providerSubId ?? "No provider subscription yet"}
            </dd>
          </div>
          <div>
            <dt>Current period end</dt>
            <dd>{formatDate(subscription?.currentPeriodEnd)}</dd>
          </div>
          <div>
            <dt>Webhook status</dt>
            <dd>
              {subscription
                ? "Last provider event synced"
                : "Waiting for first verified billing event"}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
