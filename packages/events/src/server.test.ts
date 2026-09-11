// @ts-expect-error Bun test types are not included by the package TypeScript config.
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { setupAnalytics } from "./server";

const originalFetch = globalThis.fetch;
const originalEnv = {
  LOGLY_COLLECTOR_URL: process.env.LOGLY_COLLECTOR_URL,
  LOGLY_ENABLED: process.env.LOGLY_ENABLED,
  LOGLY_PROJECT: process.env.LOGLY_PROJECT,
  LOGLY_SERVER_KEY: process.env.LOGLY_SERVER_KEY,
};

const restoreEnv = (key: keyof typeof originalEnv) => {
  const value = originalEnv[key];
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
};

beforeEach(() => {
  process.env.LOGLY_COLLECTOR_URL = "https://collector.logly.test";
  process.env.LOGLY_ENABLED = "true";
  process.env.LOGLY_PROJECT = "afterservice";
  process.env.LOGLY_SERVER_KEY = "test-server-key";
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  restoreEnv("LOGLY_COLLECTOR_URL");
  restoreEnv("LOGLY_ENABLED");
  restoreEnv("LOGLY_PROJECT");
  restoreEnv("LOGLY_SERVER_KEY");
});

describe("Afterservice server analytics", () => {
  test("tracks in local development when explicitly enabled", async () => {
    const requests: Array<{ input: string; init?: RequestInit }> = [];
    globalThis.fetch = (async (input, init) => {
      requests.push({ input: String(input), init });
      return Response.json({ accepted: 1 }, { status: 202 });
    }) as typeof fetch;

    const analytics = await setupAnalytics();
    analytics.track({
      event: "local_server_event",
      profileId: "private-user-id",
      workspaceId: "private-workspace-id",
      surface: "local-smoke",
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(requests).toHaveLength(1);
    expect(requests[0]?.input).toBe("https://collector.logly.test/v1/events");
    const batch = JSON.parse(String(requests[0]?.init?.body));
    expect(batch.events[0]).toMatchObject({
      name: "local_server_event",
      project: "afterservice",
      properties: { surface: "local-smoke" },
      source: "server",
    });
    expect(batch.events[0].properties).not.toHaveProperty("profileId");
    expect(batch.events[0].properties).not.toHaveProperty("workspaceId");
    expect(batch.events[0]).not.toHaveProperty("actorId");
  });

  test("does not track unless the explicit switch is enabled", async () => {
    let requestCount = 0;
    globalThis.fetch = (async () => {
      requestCount += 1;
      return Response.json({ accepted: 1 }, { status: 202 });
    }) as typeof fetch;
    process.env.LOGLY_ENABLED = "false";

    const analytics = await setupAnalytics();
    analytics.track({ event: "disabled_event" });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(requestCount).toBe(0);
  });

  test("fails closed when required credentials are missing", async () => {
    let requestCount = 0;
    globalThis.fetch = (async () => {
      requestCount += 1;
      return Response.json({ accepted: 1 }, { status: 202 });
    }) as typeof fetch;
    delete process.env.LOGLY_SERVER_KEY;

    const analytics = await setupAnalytics();
    analytics.track({ event: "missing_credentials" });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(requestCount).toBe(0);
  });

  test("never lets collector failure affect the product call site", async () => {
    globalThis.fetch = (async () =>
      Response.json({ error: "offline" }, { status: 503 })) as typeof fetch;

    const analytics = await setupAnalytics();
    expect(() => analytics.track({ event: "collector_offline" })).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});
