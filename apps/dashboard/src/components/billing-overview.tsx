"use client";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@afterservice/ui";
import { formatDate } from "@/lib/dashboard-format";
import { trpc } from "@/components/providers/trpc-provider";
import { useRouter } from "next/navigation";

export function BillingOverview() {
  const { data, isLoading } = trpc.billing.getCurrentPlan.useQuery();
  const router = useRouter();
  
  const checkoutMutation = trpc.billing.createCheckout.useMutation({
    onSuccess: (data) => {
      router.push(data.checkoutUrl);
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading billing...</div>;
  }

  if (!data?.item) return null;

  const { limits, plan, planStatus, subscription, usage } = data.item;

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Badge 
            variant={planStatus === "active" ? "default" : "outline"} 
            className="mb-2"
          >
            {planStatus}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground max-w-2xl">
            Subscription state is persisted from verified Lemon Squeezy
            webhooks. Checkout can start here, but redirects do not grant
            entitlement.
          </p>
        </div>
        <Button onClick={() => checkoutMutation.mutate()} disabled={checkoutMutation.isPending}>
          {checkoutMutation.isPending ? "Starting..." : "Start checkout"}
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Subscription</h2>
        <Card>
          <CardContent className="p-0">
            <dl className="divide-y divide-border">
              <div className="flex items-center justify-between p-4 sm:p-6">
                <dt className="text-sm font-medium text-muted-foreground">Provider subscription</dt>
                <dd className="text-sm font-medium">
                  {subscription?.providerSubId ?? "No provider subscription yet"}
                </dd>
              </div>
              <div className="flex items-center justify-between p-4 sm:p-6">
                <dt className="text-sm font-medium text-muted-foreground">Current period end</dt>
                <dd className="text-sm font-medium">{formatDate(subscription?.currentPeriodEnd)}</dd>
              </div>
              <div className="flex items-center justify-between p-4 sm:p-6">
                <dt className="text-sm font-medium text-muted-foreground">Webhook status</dt>
                <dd className="text-sm font-medium">
                  {subscription
                    ? "Last provider event synced"
                    : "Waiting for first verified billing event"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
