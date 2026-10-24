"use client";

import {
  getLocalizedPlanPrice,
  type PricingResolution,
} from "@afterservice/plans";
import {
  getCheckoutQuote,
  type PaidPlanId,
} from "@afterservice/plans/checkout";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Skeleton,
} from "@afterservice/ui";
import {
  isServer,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ArrowUpRight, CreditCard } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useRef } from "react";
import { formatDate } from "@/lib/dashboard-format";
import { useTRPC } from "@/trpc/client";

const planStatusLabels = {
  active: "Active",
  canceled: "Canceled",
  past_due: "Past due",
  trialing: "Trialing",
} as const;

const billingMetricSkeletons = ["customers", "follow-ups", "templates", "team"];
const billingUsageSkeletons = ["customers", "follow-ups", "templates", "team"];
const billingHistorySkeletons = ["current", "renewal", "trial"];
const paidPlans = [{ id: "business", name: "Business" }] as const;

type BillingOverviewProps = {
  initialPricing: PricingResolution;
};

export function BillingOverview({ initialPricing }: BillingOverviewProps) {
  const trpc = useTRPC();
  const pricing = initialPricing;
  const awaitingConfirmation = useSearchParams().get("checkout") === "success";
  const confirmationStartedAt = useRef(Date.now());
  const { data } = useSuspenseQuery({
    ...trpc.billing.getCurrentPlan.queryOptions(),
    refetchInterval: (query) =>
      awaitingConfirmation &&
      !query.state.data?.item.hasBusinessAccess &&
      Date.now() - confirmationStartedAt.current < 30_000
        ? 2000
        : false,
  });
  const { data: portalData } = useQuery({
    ...trpc.billing.getPortalUrl.queryOptions(),
    enabled: !isServer,
  });
  const router = useRouter();

  const checkoutMutation = useMutation(
    trpc.billing.createCheckout.mutationOptions({
      onSuccess: (data) => {
        router.push(data.checkoutUrl);
      },
    }),
  );
  function startCheckout(plan: PaidPlanId, interval: "monthly" | "yearly") {
    const quote = getCheckoutQuote(plan, interval, pricing);
    checkoutMutation.mutate({
      plan,
      interval,
      currency: quote.currency,
      countryCode: quote.countryCode,
      expectedAmountMinor: quote.amountMinor,
    });
  }

  if (!data?.item) {
    return <BillingOverviewEmptyState onRetry={() => router.refresh()} />;
  }

  const {
    isCheckoutEnabled,
    hasBusinessAccess,
    limits,
    planDisplayName,
    planStatus,
    subscription,
    usage,
  } = data.item;
  const planLabel = planDisplayName;
  const planStatusLabel =
    planDisplayName === "Free"
      ? "Free"
      : (planStatusLabels[planStatus] ?? planStatus);
  const usageItems = [
    {
      label: "Customers",
      limit: limits.customers,
      value: usage.customers,
    },
    {
      label: "Follow-ups",
      limit: limits.followUps,
      value: usage.followUps,
    },
    {
      label: "Templates",
      limit: limits.templates,
      value: usage.templates,
    },
    {
      label: "Team members",
      limit: limits.teamMembers,
      value: usage.teamMembers,
    },
  ];

  return (
    <div className="max-w-[900px] space-y-8 py-6">
      <header className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={planStatus === "active" ? "default" : "outline"}
              className="w-fit"
            >
              {planStatusLabel}
            </Badge>
            <Badge variant="outline">{planLabel}</Badge>
          </div>
          <div className="space-y-1">
            <h1 className="font-[family-name:var(--font-display)] text-[26px] leading-[1.1] tracking-[-0.01em] md:text-[30px]">
              Billing
            </h1>
            <p className="text-muted-foreground">
              You are on {planDisplayName}. Manage your plan, usage and payment
              details here.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {portalData?.portalUrl ? (
            <Button asChild variant="outline">
              <a href={portalData.portalUrl}>
                Portal
                <ArrowUpRight className="ml-2 size-4" />
              </a>
            </Button>
          ) : null}
          <Button
            onClick={() =>
              document
                .getElementById("paid-plans")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            disabled={
              !isCheckoutEnabled ||
              hasBusinessAccess ||
              checkoutMutation.isPending
            }
          >
            <CreditCard className="mr-2 size-4" />
            {hasBusinessAccess
              ? "Business active"
              : isCheckoutEnabled
                ? checkoutMutation.isPending
                  ? "Starting..."
                  : "Choose Business"
                : "Payments temporarily unavailable"}
          </Button>
        </div>
      </header>
      {awaitingConfirmation ? (
        <p role="status" className="text-sm text-muted-foreground">
          {hasBusinessAccess
            ? "Business is active. Your payment has been confirmed."
            : "Waiting for payment confirmation. Your plan updates after Polar confirms the subscription. Refresh if it does not appear shortly."}
        </p>
      ) : null}
      {checkoutMutation.error ? (
        <p role="alert" className="text-sm text-destructive">
          {checkoutMutation.error.message}
        </p>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <PlanMetric
          label="Plan"
          value={planDisplayName}
          detail={planStatusLabel}
        />
        {usageItems.slice(0, 3).map((item) => (
          <PlanMetric
            key={item.label}
            label={item.label}
            value={`${item.value}/${item.limit}`}
            detail={`${usagePercent(item.value, item.limit)}% used`}
          />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card className="rounded-[14px]">
          <CardHeader className="border-b pb-5">
            <CardTitle className="mb-1 text-base">Usage</CardTitle>
            <p className="text-sm text-muted-foreground">
              Current workspace usage against plan limits.
            </p>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {usageItems.map((item) => (
              <UsageRow key={item.label} {...item} />
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[14px]">
          <CardHeader className="border-b pb-5">
            <CardTitle className="mb-1 text-base">Subscription</CardTitle>
            <p className="text-sm text-muted-foreground">
              Provider state and renewal details.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <dl className="divide-y divide-border">
              <BillingRow label="Provider subscription">
                {subscription?.providerSubId ??
                  "Free, no provider subscription"}
              </BillingRow>
              <BillingRow label="Current period end">
                {formatDate(subscription?.currentPeriodEnd)}
              </BillingRow>
              <BillingRow label="Webhook status">
                {subscription
                  ? "Last provider event synced"
                  : "Paid billing is not active for this workspace"}
              </BillingRow>
            </dl>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-[14px]">
        <CardHeader className="border-b pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle id="paid-plans" className="mb-1 text-base">
                Business
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                One monthly price per business in the currency for your country.
                Unsupported or unknown locations use USD.
              </p>
            </div>
          </div>
          {pricing.region === "OTHER" ? (
            <p className="mt-3 text-xs text-muted-foreground">{pricing.note}</p>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-3 pt-6">
          {paidPlans.map((paidPlan) => {
            const price = getLocalizedPlanPrice(paidPlan.id, pricing);

            return (
              <div
                key={paidPlan.id}
                className="rounded-xl border border-border p-4"
              >
                <p className="font-[family-name:var(--font-display)] text-xl leading-[1.1]">
                  {paidPlan.name}
                </p>
                <p className="mt-2.5 font-[family-name:var(--font-display)] text-[32px] leading-[1.2] tracking-[-0.02em] tabular-nums sm:text-[36px]">
                  {price.formattedMonthly}
                </p>
                <p className="text-xs text-muted-foreground">
                  per business / month, including applicable taxes
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Up to 3 users, 1,000 customers, 3,000 stored follow-ups and 25
                  templates.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  AI assistant and connected WhatsApp operations: coming soon.
                  Shared AI usage limits will be announced before those features
                  launch.
                </p>
                {isCheckoutEnabled && !hasBusinessAccess ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={checkoutMutation.isPending}
                      onClick={() => startCheckout(paidPlan.id, "monthly")}
                    >
                      Subscribe to Business
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="text-lg font-medium">Billing details</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Free needs no credit card. Business renews monthly and can be canceled
          from the billing portal. AI assistant and WhatsApp operations are
          coming soon. Customer-message delivery, when available, is charged
          separately.
        </p>
      </section>
    </div>
  );
}

export function BillingOverviewSkeleton() {
  return (
    <div className="max-w-[900px] space-y-8 py-6">
      <header className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-5 w-full max-w-[560px]" />
            <Skeleton className="h-5 w-3/4 max-w-[440px]" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-48" />
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {billingMetricSkeletons.map((item) => (
          <Card key={item} className="rounded-[14px]">
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card className="rounded-[14px]">
          <CardHeader className="border-b pb-5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {billingUsageSkeletons.map((item) => (
              <div key={item} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[14px]">
          <CardHeader className="border-b pb-5">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {billingHistorySkeletons.map((item) => (
              <div key={item} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function BillingOverviewEmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="max-w-[900px] space-y-8 py-6">
      <header className="border-b border-border pb-8">
        <div className="max-w-2xl space-y-2">
          <h1 className="font-[family-name:var(--font-display)] text-[26px] leading-[1.1] tracking-[-0.01em] md:text-[30px]">
            Billing
          </h1>
          <p className="text-muted-foreground">
            Billing details are not available for this workspace yet.
          </p>
        </div>
      </header>

      <Card className="rounded-[14px]">
        <CardContent className="flex flex-col items-start gap-4 p-6">
          <div className="space-y-1">
            <p className="text-sm font-medium">No billing profile found</p>
            <p className="max-w-xl text-sm text-muted-foreground">
              Refresh the workspace billing state to load plan, usage, and
              subscription details.
            </p>
          </div>
          <Button variant="outline" onClick={onRetry}>
            Refresh billing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PlanMetric({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-[14px]">
      <CardContent className="p-5">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-none tabular-nums">
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function UsageRow({
  label,
  limit,
  value,
}: {
  label: string;
  limit: number;
  value: number;
}) {
  const percent = usagePercent(value, limit);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {value}/{limit}
        </span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
}

function BillingRow({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 sm:p-6">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

function usagePercent(value: number, limit: number) {
  if (limit <= 0) return 0;

  return Math.min(100, Math.round((value / limit) * 100));
}
