// @ts-expect-error Bun test types are not included by the package TypeScript config.
import { afterEach, describe, expect, test } from "bun:test";
import type { AnalyticsBatch } from "@ishaqyusuf/logly-core";
import { createAnalyticsRoute } from "@ishaqyusuf/logly-next";

const originalFetch = globalThis.fetch;
const originalVercel = process.env.VERCEL;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalVercel === undefined)
    Reflect.deleteProperty(process.env, "VERCEL");
  else process.env.VERCEL = originalVercel;
});

test.each([
  [
    "Cloudflare visitor before Vercel proxy",
    "1",
    { "cf-ipcountry": "NG", "cf-ray": "edge", "x-vercel-ip-country": "US" },
    "NG",
  ],
  ["Vercel direct", "1", { "x-vercel-ip-country": "GB" }, "GB"],
  ["normalized country", "1", { "cf-ipcountry": " ng " }, "NG"],
  [
    "missing Cloudflare location",
    "1",
    { "cf-ray": "edge", "x-vercel-ip-country": "US" },
    null,
  ],
  [
    "invalid Cloudflare location",
    "1",
    { "cf-ipcountry": "unknown", "x-vercel-ip-country": "US" },
    null,
  ],
  ["no edge location", "1", {}, null],
  [
    "local header spoofing",
    "0",
    { "cf-ipcountry": "NG", "x-vercel-ip-country": "US" },
    null,
  ],
] as const)("forwards country: %s", async (_label: string, vercel: string, edgeHeaders: Record<
  string,
  string
>, expected: string | null) => {
  process.env.VERCEL = vercel;
  const calls: RequestInit[] = [];
  globalThis.fetch = (async (_input, init) => {
    calls.push(init ?? {});
    return Response.json({ accepted: 1 }, { status: 202 });
  }) as typeof fetch;
  const handler = createAnalyticsRoute({
    collectorUrl: "https://collector.logly.test",
    projectKey: "client-ingest-key",
    trustCloudflareCountry: true,
  });
  const response = await handler(
    new Request("https://afterservice.test/api/analytics", {
      method: "POST",
      headers: {
        ...edgeHeaders,
        origin: "https://afterservice.test",
        "content-type": "application/json",
        "x-logly-country": "FR",
        "x-forwarded-for": "192.0.2.1",
      },
      body: JSON.stringify({
        sentAt: "2026-10-24T10:00:00.000Z",
        sdk: { name: "@ishaqyusuf/logly-core", version: "0.2.0" },
        events: [
          {
            eventId: "00000000-0000-4000-8000-000000000002",
            project: "afterservice",
            name: "site_visit",
            version: 1,
            source: "browser",
            occurredAt: "2026-10-24T10:00:00.000Z",
            properties: {},
            country: "FR",
          },
        ],
      }),
    }),
  );
  expect(response.status).toBe(202);
  expect(calls).toHaveLength(1);
  const headers = new Headers(calls[0]?.headers);
  expect(headers.get("x-logly-country")).toBe(expected);
  expect(headers.get("x-logly-project-key")).toBe("client-ingest-key");
  expect(headers.get("x-logly-origin")).toBe("https://afterservice.test");
  expect(headers.get("x-forwarded-for")).toBeNull();
  expect(JSON.parse(String(calls[0]?.body)).events[0].country).toBeUndefined();
});

describe("Afterservice same-origin analytics route", () => {
  test("forwards a new event name with the scoped key and browser origin", async () => {
    const batch: AnalyticsBatch = {
      sentAt: "2026-09-01T08:00:00.000Z",
      sdk: { name: "@ishaqyusuf/logly-core", version: "0.2.0" },
      events: [
        {
          eventId: "00000000-0000-4000-8000-000000000001",
          project: "afterservice",
          name: "new_afterservice_event",
          version: 1,
          source: "browser",
          occurredAt: "2026-09-01T08:00:00.000Z",
          properties: { surface: "website" },
        },
      ],
    };
    const calls: Array<{ input: string; init?: RequestInit }> = [];
    globalThis.fetch = (async (input, init) => {
      calls.push({ input: String(input), init });
      return Response.json({ accepted: 1 }, { status: 202 });
    }) as typeof fetch;
    const handler = createAnalyticsRoute({
      collectorUrl: "https://collector.logly.test",
      projectKey: "client-ingest-key",
    });

    const response = await handler(
      new Request("https://afterservice.test/api/analytics", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://afterservice.test",
        },
        body: JSON.stringify(batch),
      }),
    );

    expect(response.status).toBe(202);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.input).toBe("https://collector.logly.test/v1/events");
    const headers = new Headers(calls[0]?.init?.headers);
    expect(headers.get("x-logly-project-key")).toBe("client-ingest-key");
    expect(headers.get("x-logly-origin")).toBe("https://afterservice.test");
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual(batch);
  });
});
