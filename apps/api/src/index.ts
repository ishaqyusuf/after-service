import { auth, getTrustedOrigins } from "@afterservice/auth";
import { buildWorkspaceTemplateSeed, getDbClient } from "@afterservice/db";
import { getAppUrls } from "@afterservice/utils";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { createContext } from "./context";
import { appRouter } from "./routers/_app";

const app = new Hono();
const trustedOrigins = getTrustedOrigins();

app.use(
  "/api/*",
  cors({
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    origin: (origin) => {
      return trustedOrigins.includes(origin) ? origin : trustedOrigins[0];
    },
  }),
);

const onboardingSchema = z.object({
  businessName: z.string().trim().min(1),
  businessType: z.string().trim().optional(),
  defaultFollowUpDelayDays: z.coerce.number().int().min(1).max(365).default(7),
  serviceCategory: z.string().trim().optional(),
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
  const urls = getAppUrls();

  return c.json({
    ok: true,
    service: "afterservice-api",
    urls,
  });
});

app.all("/trpc/*", (c) => {
  return fetchRequestHandler({
    createContext: () => createContext(c.req.raw),
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
  });
});

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
    return c.json({ error: "Invalid onboarding payload" }, 400);
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
    return c.json({
      ok: true,
      workspace: existingMembership.workspace,
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

app.post("/webhooks/lemon-squeezy", async (c) => {
  const body = await c.req.text();

  return c.json({
    ok: true,
    received: body.length > 0,
    service: "afterservice-lemon-squeezy-webhook-placeholder",
  });
});

export default {
  fetch: app.fetch,
  port: Number(process.env.PORT ?? 4102),
};
