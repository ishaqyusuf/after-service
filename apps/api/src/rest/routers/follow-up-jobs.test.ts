import { afterEach, expect, spyOn, test } from "bun:test";
import * as jobs from "@afterservice/jobs";
import app from "./follow-up-jobs";

const originalSecret = process.env.CRON_SECRET;
afterEach(() => {
  if (originalSecret) process.env.CRON_SECRET = originalSecret;
  else delete process.env.CRON_SECRET;
});

test("scheduled processing fails closed without a secret or valid credentials", async () => {
  delete process.env.CRON_SECRET;
  expect((await app.request("/mark-missed")).status).toBe(503);
  process.env.CRON_SECRET = "cron-test-secret";
  for (const authorization of [undefined, "Bearer wrong", "Bearer éééééééé"]) {
    const response = await app.request("/mark-missed", {
      headers: authorization ? { authorization } : {},
    });
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
  }
});

test("the authenticated schedule uses the server clock and accepts no overrides", async () => {
  process.env.CRON_SECRET = "cron-test-secret";
  const markMissed = spyOn(jobs, "markMissedFollowUps").mockResolvedValue({
    missed: 2,
    ok: true,
    processed: 2,
  });
  try {
    const headers = { authorization: "Bearer cron-test-secret" };
    const rejected = await app.request("/mark-missed?now=2099-01-01", {
      headers,
    });
    expect(rejected.status).toBe(400);
    expect(markMissed).not.toHaveBeenCalled();
    const response = await app.request("/mark-missed", { headers });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(markMissed).toHaveBeenCalledWith();
    expect(await response.json()).toMatchObject({
      mode: "mark-missed",
      result: { missed: 2, processed: 2 },
    });
  } finally {
    markMissed.mockRestore();
  }
});
