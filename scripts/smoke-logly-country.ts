import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

const portlessCa = resolve(homedir(), ".portless", "ca.pem");
if (!process.env.NODE_EXTRA_CA_CERTS && existsSync(portlessCa)) {
  const child = Bun.spawn([process.execPath, import.meta.path], {
    env: { ...process.env, NODE_EXTRA_CA_CERTS: portlessCa },
    stdout: "inherit",
    stderr: "inherit",
  });
  process.exit(await child.exited);
}

assert(process.env.LOGLY_COLLECTOR_URL, "LOGLY_COLLECTOR_URL is required");
const collector = new URL(process.env.LOGLY_COLLECTOR_URL);
assert(
  collector.hostname.endsWith(".localhost"),
  "Only a local Logly collector may be used",
);
assert(process.env.LOGLY_PROJECT_KEY && process.env.LOGLY_READ_KEY);
process.env.VERCEL = "1"; // Reproduce hosting-edge metadata in this isolated test process only.
const { POST } = await import("../packages/events/src/route");
const project = process.env.LOGLY_PROJECT ?? "afterservice";
const origin = "https://afterservice.localhost";
const now = new Date().toISOString();
const id = crypto.randomUUID();
const unknownId = crypto.randomUUID();
const base = {
  project,
  name: "site_visit",
  version: 1,
  source: "browser",
  occurredAt: now,
  properties: { surface: "country-forwarding-local-qa" },
  route: "/country-qa",
  country: "FR",
};
async function send(eventId: string, edge: Record<string, string>) {
  const response = await POST(
    new Request(`${origin}/api/analytics`, {
      method: "POST",
      headers: {
        origin,
        "content-type": "application/json",
        "x-logly-country": "FR",
        ...edge,
      },
      body: JSON.stringify({
        sentAt: now,
        sdk: { name: "@ishaqyusuf/logly-core", version: "0.2.0" },
        events: [{ ...base, eventId }],
      }),
    }),
  );
  assert.equal(
    response.status,
    202,
    "collector must accept real Afterservice proxy request",
  );
  return response.json();
}
assert.equal(
  (
    await send(id, {
      "cf-ipcountry": "NG",
      "cf-ray": "fixture",
      "x-vercel-ip-country": "US",
    })
  ).accepted,
  1,
);
assert.equal(
  (await send(id, { "cf-ipcountry": "GB", "cf-ray": "fixture" })).duplicate,
  1,
);
assert.equal(
  (await send(unknownId, { "cf-ray": "fixture", "x-vercel-ip-country": "US" }))
    .accepted,
  1,
);
async function read(eventId: string) {
  const response = await fetch(
    new URL(
      `/v1/dashboard/events/${eventId}?project=${encodeURIComponent(project)}`,
      collector,
    ),
    { headers: { authorization: `Bearer ${process.env.LOGLY_READ_KEY}` } },
  );
  assert.equal(response.status, 200);
  return response.json();
}
const known = await read(id),
  unknown = await read(unknownId);
assert.equal(known.country, "NG");
assert.equal(unknown.country, null);
assert.equal(known.project, project);
const summaryResponse = await fetch(
  new URL(
    `/v1/dashboard/event-summary?project=${encodeURIComponent(project)}&start=${encodeURIComponent(now)}`,
    collector,
  ),
  { headers: { authorization: `Bearer ${process.env.LOGLY_READ_KEY}` } },
);
assert.equal(summaryResponse.status, 200);
const summary = await summaryResponse.json();
assert(
  summary.geography.countries.some(
    (country: { code: string; count: number }) =>
      country.code === "NG" && country.count >= 1,
  ),
);
assert(summary.geography.unknownVisits >= 1);
console.log(
  "PASS: actual Afterservice POST → authenticated Logly collector → database → detail/summary reads; NG persists, retry stays NG, missing Cloudflare stays unknown, body override ignored",
);
