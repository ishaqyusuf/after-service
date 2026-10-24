import { createHmac, timingSafeEqual } from "node:crypto";
import { auth, getTrustedOrigins } from "@afterservice/auth";
import {
  buildWorkspaceTemplateSeed,
  getDbClient,
  getQaWorkspaceClassification,
} from "@afterservice/db";
import { getDevAppUrlStrings } from "@afterservice/utils";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type Context, Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { assistantApiError } from "./assistant/access";
import { assistantChatResponse } from "./assistant/chat";
import { createContext } from "./context";
import followUpJobs from "./rest/routers/follow-up-jobs";
import oversight from "./rest/routers/oversight";
import polarWebhook from "./rest/routers/polar-webhook";
import { appRouter } from "./routers/_app";
import { lemonWebhookSchema, onboardingSchema } from "./schemas";

const app = new Hono();
const trustedOrigins = getTrustedOrigins();

app.use(
  "*",
  cors({
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    origin: (origin) => {
      return trustedOrigins.includes(origin) ? origin : undefined;
    },
  }),
);

app.use("/api/assistant/*", bodyLimit({ maxSize: 16000 }));
app.post("/api/assistant/chat", async (c) => {
  if (!trustedOrigins.includes(c.req.header("origin") ?? ""))
    return c.json({ error: "Untrusted request origin." }, 403);
  try {
    return await assistantChatResponse(
      c.req.raw,
      await createContext(c.req.raw),
    );
  } catch (error) {
    const failure = assistantApiError(error);
    const status =
      failure.code === "UNAUTHORIZED"
        ? 401
        : failure.code === "FORBIDDEN"
          ? 403
          : failure.code === "NOT_FOUND"
            ? 404
            : failure.code === "TOO_MANY_REQUESTS"
              ? 429
              : failure.code === "CONFLICT"
                ? 409
                : failure.code === "BAD_REQUEST"
                  ? 400
                  : 503;
    return c.json({ error: failure.message }, status);
  }
});

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || `workspace-${crypto.randomUUID().slice(0, 8)}`
  );
}

app.get("/health", (c) => {
  const urls = getDevAppUrlStrings();

  return c.json({
    ok: true,
    service: "afterservice-api",
    urls,
  });
});

function handleTrpcRequest(c: Context) {
  return fetchRequestHandler({
    createContext: () => createContext(c.req.raw),
    endpoint: c.req.path.startsWith("/api/trpc") ? "/api/trpc" : "/trpc",
    req: c.req.raw,
    router: appRouter,
  });
}

app.all("/api/trpc/*", handleTrpcRequest);
app.all("/trpc/*", handleTrpcRequest);

app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.post("/api/onboarding", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const parsed = onboardingSchema.safeParse(await c.req.json());

  if (!parsed.success) {
    return c.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid onboarding payload",
      },
      400,
    );
  }

  const db = getDbClient();
  const existingMembership = await db.membership.findFirst({
    select: {
      workspace: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
    where: {
      userId: session.user.id,
    },
  });

  if (existingMembership) {
    const workspace = await db.workspace.update({
      data: {
        businessType: parsed.data.businessType || null,
        defaultFollowUpDelayDays: parsed.data.defaultFollowUpDelayDays,
        name: parsed.data.businessName,
        serviceCategory: parsed.data.serviceCategory || null,
      },
      select: {
        id: true,
        slug: true,
      },
      where: {
        id: existingMembership.workspace.id,
      },
    });

    return c.json({
      ok: true,
      workspace,
    });
  }

  const baseSlug = slugify(parsed.data.businessName);
  const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;

  const workspace = await db.$transaction(async (tx) => {
    const created = await tx.workspace.create({
      data: {
        businessType: parsed.data.businessType,
        defaultFollowUpDelayDays: parsed.data.defaultFollowUpDelayDays,
        name: parsed.data.businessName,
        serviceCategory: parsed.data.serviceCategory,
        slug,
        ...getQaWorkspaceClassification(session.user.email),
      },
      select: {
        id: true,
        slug: true,
      },
    });

    await tx.membership.create({
      data: {
        role: "owner",
        userId: session.user.id,
        workspaceId: created.id,
      },
    });

    await tx.followUpTemplate.createMany({
      data: buildWorkspaceTemplateSeed(created.id),
    });

    return created;
  });

  return c.json({
    ok: true,
    workspace,
  });
});

app.route("/api/jobs/follow-ups", followUpJobs);
app.route("/api/oversight/v1", oversight);
app.route("/webhooks/polar", polarWebhook);

app.post("/webhooks/lemon-squeezy", async (c) => {
  const body = await c.req.text();
  const signature = c.req.header("x-signature") ?? "";
  const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return c.json(
      { error: "Lemon Squeezy webhook secret is not configured" },
      503,
    );
  }

  if (!isValidLemonSignature(body, signature, webhookSecret)) {
    return c.json({ error: "Invalid webhook signature" }, 401);
  }

  const parsed = lemonWebhookSchema.safeParse(parseJson(body));
  if (!parsed.success) {
    return c.json({ error: "Invalid webhook payload" }, 400);
  }
  const payload = parsed.data;
  const providerId = String(
    payload.meta?.event_id ?? payload.data?.id ?? crypto.randomUUID(),
  );
  const eventName = String(payload.meta?.event_name ?? "unknown");
  const workspaceId =
    payload.meta?.custom_data?.workspace_id ??
    payload.meta?.custom_data?.workspaceId ??
    null;
  const db = getDbClient();

  const existing = await db.billingEvent.findUnique({
    where: { providerId },
  });

  if (existing?.processedAt) {
    return c.json({ ok: true, duplicate: true });
  }

  await db.billingEvent.upsert({
    create: {
      eventName,
      payload: payload as never,
      providerId,
      workspaceId,
    },
    update: {
      eventName,
      payload: payload as never,
      workspaceId,
    },
    where: { providerId },
  });

  if (workspaceId && isSubscriptionEvent(eventName)) {
    const status = mapLemonStatus(payload.data?.attributes?.status);
    const plan = mapLemonVariant(payload.data?.attributes?.variant_id);

    await db.subscription.upsert({
      create: {
        currentPeriodEnd: parseOptionalDate(
          payload.data?.attributes?.renews_at ??
            payload.data?.attributes?.ends_at,
        ),
        providerCustomerId: toStringOrNull(
          payload.data?.attributes?.customer_id,
        ),
        providerSubId: String(payload.data?.id ?? providerId),
        status,
        variantId: toStringOrNull(payload.data?.attributes?.variant_id),
        workspaceId,
      },
      update: {
        currentPeriodEnd: parseOptionalDate(
          payload.data?.attributes?.renews_at ??
            payload.data?.attributes?.ends_at,
        ),
        providerCustomerId: toStringOrNull(
          payload.data?.attributes?.customer_id,
        ),
        status,
        variantId: toStringOrNull(payload.data?.attributes?.variant_id),
      },
      where: {
        providerSubId: String(payload.data?.id ?? providerId),
      },
    });

    await db.workspace.update({
      data: {
        plan,
        planStatus: status,
      },
      where: { id: workspaceId },
    });
  }

  await db.billingEvent.update({
    data: { processedAt: new Date() },
    where: { providerId },
  });

  return c.json({
    ok: true,
    eventName,
    received: body.length > 0,
    service: "afterservice-lemon-squeezy-webhook",
  });
});

export default app;

export { app };

function isValidLemonSignature(
  body: string,
  signature: string,
  secret: string,
) {
  if (!signature) return false;
  const digest = createHmac("sha256", secret).update(body).digest("hex");
  const digestBuffer = Buffer.from(digest, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  if (digestBuffer.length !== signatureBuffer.length) return false;

  return timingSafeEqual(digestBuffer, signatureBuffer);
}

function parseJson(body: string): unknown {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function isSubscriptionEvent(eventName: string) {
  return [
    "subscription_created",
    "subscription_updated",
    "subscription_cancelled",
    "subscription_resumed",
    "subscription_expired",
    "subscription_paused",
    "subscription_unpaused",
    "subscription_payment_success",
  ].includes(eventName);
}

function mapLemonStatus(value: unknown) {
  const status = String(value ?? "").toLowerCase();

  if (status === "active") return "active";
  if (status === "past_due" || status === "paused" || status === "expired") {
    return "past_due";
  }
  if (status === "cancelled" || status === "canceled") return "canceled";

  return "trialing";
}

function mapLemonVariant(value: unknown) {
  const variantId = String(value ?? "");

  if (variantId === process.env.LEMON_SQUEEZY_PRO_VARIANT_ID) return "pro";
  if (variantId === process.env.LEMON_SQUEEZY_GROWTH_VARIANT_ID) {
    return "growth";
  }

  return "starter";
}

function parseOptionalDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toStringOrNull(value: unknown) {
  return value == null ? null : String(value);
}
