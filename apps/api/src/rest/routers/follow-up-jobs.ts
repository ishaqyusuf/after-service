import { timingSafeEqual } from "node:crypto";
import { markMissedFollowUps, runDueFollowUpsDryRun } from "@afterservice/jobs";
import { Hono } from "hono";
import { z } from "zod";

const payloadSchema = z.object({
  markMissed: z.boolean().default(false),
  now: z.iso.datetime().optional(),
  workspaceId: z.string().trim().min(1).optional(),
});

const app = new Hono();

app.use("*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return c.json({ error: "Cron secret is not configured" }, 503);
  }
  const provided =
    c.req.header("authorization")?.replace(/^Bearer\s+/i, "") ??
    c.req.header("x-cron-secret");
  if (
    !provided ||
    Buffer.byteLength(provided) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  ) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});

app.post("/dry-run", async (c) => {
  const text = await c.req.text();
  let body: unknown = {};
  if (text.trim()) {
    try {
      body = JSON.parse(text);
    } catch {
      return c.json({ error: "Invalid follow-up job payload" }, 400);
    }
  }
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid follow-up job payload" }, 400);
  }
  const options = {
    now: parsed.data.now ? new Date(parsed.data.now) : undefined,
    workspaceId: parsed.data.workspaceId,
  };
  const result = parsed.data.markMissed
    ? await markMissedFollowUps(options)
    : await runDueFollowUpsDryRun(options);
  return c.json({
    mode: parsed.data.markMissed ? "mark-missed" : "dry-run",
    ok: true,
    result,
    service: "afterservice-follow-up-jobs",
  });
});

app.get("/mark-missed", async (c) => {
  if (Object.keys(c.req.query()).length) {
    return c.json(
      { error: "Scheduled processing accepts no query parameters" },
      400,
    );
  }
  const result = await markMissedFollowUps();
  console.info("follow-up-cron", {
    ...result,
    completedAt: new Date().toISOString(),
    mode: "mark-missed",
  });
  return c.json({
    mode: "mark-missed",
    ok: true,
    result,
    service: "afterservice-follow-up-jobs",
  });
});

export default app;
