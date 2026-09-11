// @ts-expect-error Bun test types are not included by the package TypeScript config.
import { afterEach, describe, expect, test } from "bun:test";
import type { AnalyticsBatch } from "@ishaqyusuf/logly-core";
import { createAnalyticsRoute } from "@ishaqyusuf/logly-next";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
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
