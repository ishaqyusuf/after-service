#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const portlessCa = resolve(homedir(), ".portless", "ca.pem");

if (!process.env.NODE_EXTRA_CA_CERTS && existsSync(portlessCa)) {
  const child = Bun.spawn(
    [
      process.execPath,
      fileURLToPath(import.meta.url),
      ...process.argv.slice(2),
    ],
    {
      env: { ...process.env, NODE_EXTRA_CA_CERTS: portlessCa },
      stderr: "inherit",
      stdout: "inherit",
    },
  );
  process.exit(await child.exited);
}

const websiteUrl =
  process.env.LOGLY_SMOKE_WEBSITE_URL ?? "https://afterservice.localhost";
const collectorUrl = process.env.LOGLY_COLLECTOR_URL;
const readKey = process.env.LOGLY_READ_KEY;
const project = process.env.LOGLY_PROJECT ?? "afterservice";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function log(message) {
  console.log(`[smoke:logly:local] ${message}`);
}

assert(
  process.env.NEXT_PUBLIC_LOGLY_ENABLED === "true",
  "NEXT_PUBLIC_LOGLY_ENABLED must be true in the local profile",
);
assert(collectorUrl, "LOGLY_COLLECTOR_URL is required");
assert(readKey, "LOGLY_READ_KEY is required");

const eventId = crypto.randomUUID();
const eventName = `local_route_smoke_${Date.now()}`;
const now = new Date().toISOString();
const batch = {
  sentAt: now,
  sdk: { name: "@ishaqyusuf/logly-core", version: "0.2.0" },
  events: [
    {
      eventId,
      project,
      name: eventName,
      version: 1,
      source: "browser",
      occurredAt: now,
      properties: { surface: "afterservice-local-smoke" },
    },
  ],
};

log(`sending ${eventName} through the Afterservice same-origin route`);
const ingest = await fetch(`${websiteUrl}/api/analytics`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    origin: websiteUrl,
  },
  body: JSON.stringify(batch),
});
const ingestBody = await ingest.json().catch(() => null);
assert(
  ingest.status === 202,
  `ingestion returned ${ingest.status}: ${JSON.stringify(ingestBody)}`,
);

const eventsUrl = new URL("/v1/dashboard/events", collectorUrl);
eventsUrl.searchParams.set("project", project);
let matchedEvent;

for (let attempt = 1; attempt <= 60; attempt += 1) {
  const response = await fetch(eventsUrl, {
    headers: { authorization: `Bearer ${readKey}` },
  });
  assert(response.ok, `Logly read returned ${response.status}`);
  const body = await response.json();
  matchedEvent = body.data?.find((event) => event.id === eventId);
  if (matchedEvent) break;
  await Bun.sleep(500);
}

assert(matchedEvent, "the ingested event did not appear in Logly reads");
assert(matchedEvent.name === eventName, "the Logly event name changed");
assert(
  matchedEvent.project === project,
  "the Logly event was assigned to the wrong project",
);
assert(
  matchedEvent.properties?.surface === "afterservice-local-smoke",
  "the Logly event properties did not round-trip",
);

log(`verified ${eventName} in Logly for project ${project}`);
