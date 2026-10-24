import { getDbClient } from "@afterservice/db";
import { webhooks } from "@polar-sh/sdk/2026-10";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { getPolarBillingConfig, getPolarClient } from "../../utils/polar";
import { syncPolarSubscription } from "../../utils/polar-subscription";

const router = new Hono();
router.use("*", bodyLimit({ maxSize: 256 * 1024 }));
router.post("/", async (c) => {
  let config: ReturnType<typeof getPolarBillingConfig>;
  try {
    config = getPolarBillingConfig();
  } catch {
    return c.json({ error: "Billing is not configured" }, 503);
  }
  let event: Awaited<ReturnType<typeof webhooks.validateEvent>>;
  try {
    event = await webhooks.validateEvent(
      await c.req.text(),
      {
        "webhook-id": c.req.header("webhook-id") ?? "",
        "webhook-timestamp": c.req.header("webhook-timestamp") ?? "",
        "webhook-signature": c.req.header("webhook-signature") ?? "",
      },
      config.webhookSecret,
    );
  } catch (error) {
    if (error instanceof webhooks.PolarWebhookVerificationError)
      return c.json({ error: "Invalid webhook signature" }, 401);
    if (error instanceof webhooks.PolarWebhookUnknownTypeError)
      return c.json({ ignored: true }, 202);
    return c.json({ error: "Invalid webhook payload" }, 400);
  }
  switch (event.type) {
    case "subscription.created":
    case "subscription.active":
    case "subscription.updated":
    case "subscription.canceled":
    case "subscription.uncanceled":
    case "subscription.revoked":
    case "subscription.past_due":
    case "subscription.paused":
    case "subscription.resumed":
    case "subscription.cycled": {
      if (event.data.product_id !== config.productId)
        return c.json({ ignored: true }, 202);
      try {
        // A delayed delivery must use the current provider state, not an old payload.
        const snapshot = await getPolarClient().subscriptions.get(
          event.data.id,
        );
        const result = await syncPolarSubscription(getDbClient(), {
          snapshot,
          eventId: c.req.header("webhook-id") ?? "",
          eventName: event.type,
          organizationId: config.organizationId,
          productId: config.productId,
          environment: config.environment,
        });
        return c.json({ ok: true, ...result });
      } catch {
        return c.json({ error: "Webhook processing failed" }, 500);
      }
    }
    default:
      return c.json({ ignored: true }, 202);
  }
});

export default router;
