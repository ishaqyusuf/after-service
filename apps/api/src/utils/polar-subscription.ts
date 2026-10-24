import type { PrismaClient } from "@afterservice/db";
import { businessMonthlyPrices } from "@afterservice/plans";
import { z } from "zod";

const subscriptionSnapshot = z.object({
  id: z.string().min(1),
  created_at: z.iso.datetime({ offset: true }),
  modified_at: z.iso.datetime({ offset: true }).nullable(),
  status: z.string(),
  amount: z.number().int().nonnegative(),
  currency: z.enum(["usd", "gbp", "eur", "cad", "ngn"]),
  recurring_interval: z.literal("month"),
  recurring_interval_count: z.literal(1),
  current_period_end: z.iso.datetime({ offset: true }),
  cancel_at_period_end: z.boolean(),
  canceled_at: z.iso.datetime({ offset: true }).nullable(),
  ended_at: z.iso.datetime({ offset: true }).nullable(),
  customer_id: z.string().min(1),
  product_id: z.string().min(1),
  customer: z.object({ external_id: z.string().min(1) }),
  product: z.object({ organization_id: z.string().min(1) }),
});

// Called only after signature validation and an authenticated provider re-fetch.
export async function syncPolarSubscription(
  db: PrismaClient,
  input: {
    snapshot: unknown;
    eventId: string;
    eventName: string;
    organizationId: string;
    productId: string;
    environment: "sandbox" | "production";
    now?: Date;
  },
) {
  const raw = z.object({ product_id: z.string() }).parse(input.snapshot);
  if (raw.product_id !== input.productId) return { ignored: true };
  const sub = subscriptionSnapshot.parse(input.snapshot);
  if (sub.product.organization_id !== input.organizationId)
    throw new Error("Subscription organization mismatch");
  const currency =
    sub.currency.toUpperCase() as keyof typeof businessMonthlyPrices;
  if (sub.amount !== businessMonthlyPrices[currency] * 100)
    throw new Error("Subscription amount does not match Business pricing");
  const now = input.now ?? new Date();
  const periodEnd = new Date(sub.current_period_end);
  const hasAccess =
    !sub.ended_at &&
    periodEnd > now &&
    (sub.status === "active" ||
      (sub.status === "canceled" && sub.cancel_at_period_end));
  const status = hasAccess
    ? "active"
    : sub.status === "past_due"
      ? "past_due"
      : "canceled";
  const revision = new Date(sub.modified_at ?? sub.created_at).getTime();
  const workspaceId = sub.customer.external_id;
  const providerId = `polar:${input.environment}:${input.eventId}`;
  const checkpointId = `polar:${input.environment}:subscription:${sub.id}`;

  return db.$transaction(async (tx) => {
    // Serialize subscription events for one workspace, including duplicate deliveries.
    await tx.$queryRaw`SELECT id FROM "Workspace" WHERE id = ${workspaceId} FOR UPDATE`;
    const workspace = await tx.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: { dataClassification: true },
    });
    if (workspace.dataClassification === "qa")
      throw new Error("QA payment effects are disabled");
    const received = await tx.billingEvent.findUnique({
      where: { providerId },
    });
    if (received?.processedAt) return { duplicate: true };
    const existing = await tx.subscription.findUnique({
      where: { providerSubId: sub.id },
    });
    if (existing && existing.workspaceId !== workspaceId)
      throw new Error("Subscription workspace mismatch");
    const checkpoint = await tx.billingEvent.findUnique({
      where: { providerId: checkpointId },
    });
    const previous = z
      .object({ revision: z.number(), hasAccess: z.boolean() })
      .safeParse(checkpoint?.payload);
    const stale =
      previous.success &&
      (revision < previous.data.revision ||
        (revision === previous.data.revision &&
          !previous.data.hasAccess &&
          hasAccess));
    const summary = {
      subscriptionId: sub.id,
      status: sub.status,
      revision,
      hasAccess,
    };
    await tx.billingEvent.upsert({
      where: { providerId },
      create: {
        providerId,
        workspaceId,
        provider: "polar",
        eventName: input.eventName,
        payload: summary,
        processedAt: now,
      },
      update: { processedAt: now },
    });
    if (stale) return { stale: true };
    await tx.subscription.upsert({
      where: { providerSubId: sub.id },
      create: {
        workspaceId,
        provider: "polar",
        providerSubId: sub.id,
        providerCustomerId: sub.customer_id,
        variantId: sub.product_id,
        status,
        currentPeriodEnd: periodEnd,
        canceledAt: sub.canceled_at ? new Date(sub.canceled_at) : null,
      },
      update: {
        providerCustomerId: sub.customer_id,
        variantId: sub.product_id,
        status,
        currentPeriodEnd: periodEnd,
        canceledAt: sub.canceled_at ? new Date(sub.canceled_at) : null,
      },
    });
    const active = await tx.subscription.findFirst({
      where: {
        workspaceId,
        provider: "polar",
        status: "active",
        variantId: input.productId,
        currentPeriodEnd: { gt: now },
      },
    });
    await tx.workspace.update({
      where: { id: workspaceId },
      data: {
        plan: active ? "growth" : "starter",
        planStatus: active ? "active" : status,
      },
    });
    await tx.billingEvent.upsert({
      where: { providerId: checkpointId },
      create: {
        providerId: checkpointId,
        workspaceId,
        provider: "polar",
        eventName: "subscription.snapshot",
        payload: summary,
        processedAt: now,
      },
      update: { payload: summary, processedAt: now },
    });
    return { processed: true };
  });
}
