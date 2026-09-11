# First-party analytics replacement for OpenPanel

## 2026-08-31 Architecture Update

Codex task `01a05499-12a0-7b32-ae20-05f760da6e58` supersedes this document's
original Afterservice-local ownership assumption. The measurement, privacy,
event, delivery, retention, and security research below remains applicable,
but the generic implementation belongs to the standalone Logly platform.

Afterservice is the first pilot through thin `@afterservice/events` wrappers,
a same-origin Next.js route, scoped API keys, a trusted server client, and Logly
read API reporting. It must not create parallel analytics tables or copy the
Logly SDK into this repository.

## 2026-08-31 Architecture Update

The cross-project recommendation in Codex task
`01a05499-12a0-7b32-ae20-05f760da6e58` supersedes this document's original
Afterservice-local ownership assumption. The measurement, privacy, event,
delivery, retention, and security research below remains applicable, but the
generic implementation now belongs to the standalone Logly platform.

Afterservice remains the first pilot through a thin `@afterservice/events`
adapter, a same-origin Next.js route, a trusted server client, and Logly read API
reporting. It must not create parallel analytics tables or a second collector.

Date: 2026-08-30  
Status: Research recommendation; no implementation has been made  
Scope: Minimal, privacy-conscious visitor and product-event analytics for `afterservice.app`

## Executive recommendation

Replace OpenPanel with a small first-party analytics capability inside the existing `@afterservice/events` package, backed by Postgres and the existing Trigger.dev daily report.

The MVP should deliberately measure **active visitor-days**, not every page view and not purported “sessions”:

- On the public website only, send at most one `site_visit` for a browser per Africa/Lagos calendar day.
- Use a random first-party visitor ID in `localStorage` only after the applicable privacy gate allows it.
- Label the first accepted daily visit from that local record as `new`; subsequent reported days are `returning`.
- Continue sending a small allowlist of high-value funnel events, but record completed business actions (signup, workspace creation, customer creation, job creation, follow-up creation, and message sending) on the server whenever possible.
- Batch client events and use ordinary `fetch()` first. Flush a small final batch with `sendBeacon()` on `visibilitychange`; fall back to `fetch(..., { keepalive: true })` when custom headers or response handling are needed.
- Treat the public ingestion endpoint as untrusted and forgeable. Validate and bound everything, rate-limit it, deduplicate with database constraints, and never use these records for billing, permissions, security, or audit decisions.
- Store no raw IP address, email, name, customer data, full URL/query string, full referrer, or raw user-agent. Transform the local visitor ID to an HMAC-derived key at ingestion and discard the submitted ID.
- Aggregate anonymous records daily and delete visitor-level anonymous rows after a short recovery window (recommended: seven days after successful aggregation). Keep only non-identifying daily rollups longer term.

This yields directional product intelligence with low request volume, no analytics subscription, and a much smaller privacy surface than OpenPanel.

## Why this fits the repository

The migration has a clear seam:

- `packages/events` already owns the shared client provider, hooks, event catalog, identity behavior, and server helper.
- `apps/website` and `apps/dashboard` already mount that shared provider.
- `apps/api` already emits server-side product events through `setupAnalytics()`.
- `packages/jobs/src/tasks/analytics-review.ts` already sends the daily Africa/Lagos owner report and can query first-party rollups instead of OpenPanel Insights.
- The stack is Next.js 16 App Router, Hono/tRPC, Prisma/Postgres, Bun, and Trigger.dev. Next.js Route Handlers are suitable same-origin public endpoints, but the framework explicitly notes that they are publicly reachable, so all ingestion controls still apply ([Next.js Backend for Frontend guide](https://nextjs.org/docs/app/guides/backend-for-frontend)).

The public website should own anonymous visitor measurement. The dashboard should mainly emit authenticated, server-confirmed product events. This avoids placing another persistent anonymous identifier in the signed-in app.

## Measurement model

### Define the metrics precisely

| Metric | Recommended definition | Important limitation |
| --- | --- | --- |
| New visitor | A browser/origin whose analytics local record did not exist when its first accepted `site_visit` was created | Storage deletion, private browsing, another browser/device, or another origin makes the same person appear new again |
| Returning visitor | A browser/origin with an existing local analytics record that reports on a later Africa/Lagos day | It is a returning browser profile, not a verified human identity |
| Active visitor-day | One accepted `site_visit` for one derived visitor key, origin, and Africa/Lagos date | It is intentionally not a page-view count |
| Visit | Alias for active visitor-day in owner-facing reports | Do not call it a session |
| Unique visitors for a day | Distinct derived visitor keys among accepted visitor-day rows | Bots, storage resets, and blocking cause under/over-counting |
| Conversion | A named, allowlisted event such as `signup_completed` or `workspace_created` | Prefer server confirmation for outcome events |

Use the plain-language labels **Daily visitors**, **New visitors**, **Returning visitors**, and **Key events** in reports. Avoid “people,” “users,” and “sessions” for anonymous website traffic because the system cannot establish those claims.

### Request cadence

The default cadence should be:

1. On the first eligible website render, read the analytics preference and visitor record.
2. If this browser has not reported for the current Africa/Lagos date, enqueue one `site_visit`.
3. Update `lastReportedDate` only after ordinary `fetch()` receives a successful response. For a beacon flush, mark it tentatively and allow server deduplication to handle a later retry.
4. Do not track client-side route changes or reloads as page views.
5. Send high-value explicit events when they occur. Coalesce events created within a short window (for example, five seconds or up to ten events) into one request.

At one daily visit request plus occasional conversions, traffic scales roughly with daily active browser profiles rather than page views.

### Suggested local record

Use one versioned key, for example `afterservice.analytics.v1`:

```ts
type LocalAnalyticsState = {
  visitorId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastReportedDate: string | null;
  reportedDayCount: number;
  version: 1;
};
```

Generate `visitorId` with `crypto.randomUUID()`, which produces a cryptographically random v4 UUID in secure contexts ([MDN `Crypto.randomUUID()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID)). Do not encode timestamps, IP information, user data, or campaign information into the ID.

Use this classification algorithm:

```text
privacy gate denies analytics -> clear analytics visitor state; do not enqueue
storage read throws -> use ephemeral in-memory state; status = unknown
record missing -> create record; visitorStatus = new
record present -> visitorStatus = returning
lastReportedDate == current Lagos date -> do not enqueue site_visit
otherwise -> enqueue one site_visit and update lastSeenAt
```

The server must not trust `visitorStatus` for anything consequential. It is only a measurement hint. A short-lived visitor-day staging table and a unique `(visitorKey, origin, reportDate)` constraint should resolve multiple-tab races and repeated delivery.

### `localStorage` limitations

`localStorage` persists across browser sessions but is scoped to a document origin; private-browsing data is cleared when the last private tab closes. Access may also throw when browser policy disallows persistence, and browsers may treat cookie blocking as a request to prevent persistence ([MDN `localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)). Therefore:

- Wrap every read, parse, write, and delete in a small storage adapter with `try/catch`.
- Validate the parsed version and fields; replace corrupt or unknown versions safely.
- Never make site behavior depend on analytics storage.
- Expect visitors who clear site data or use private browsing to appear new.
- Expect Safari/Firefox privacy features and extensions to reduce coverage.
- Do not attempt fingerprinting as a fallback.

The HTML standard also notes that the storage API has no locking mechanism across browsing contexts ([WHATWG Web Storage](https://html.spec.whatwg.org/dev/webstorage.html)). Two tabs can both decide a daily visit is due; the database uniqueness rule, not a fragile client lock, must be the final deduplication boundary.

`https://afterservice.app` and `https://dashboard.afterservice.app` are different origins and do not share local storage. That is a feature for this MVP: do not silently join anonymous website and dashboard histories. Once a person is authenticated, record server-side product outcomes against internal user/workspace IDs without retroactively linking the anonymous visitor.

## Session semantics

Do not implement or report sessions in the first release.

`sessionStorage` ends with a page session and is tab-scoped, while `localStorage` is persistent ([MDN Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)). A common inactivity rule such as “30 minutes” is an analytics convention, not a browser primitive. With no page-view events and only sparse conversions, the server cannot reliably know when a visitor became inactive. A tab ID would count tabs, and a `sessionStorage` ID would split multi-tab use.

If a future question genuinely requires sessions, add an explicit specification first:

- `sessionId` is an ephemeral random ID.
- A session rolls after 30 minutes of local inactivity.
- Activity is coordinated across tabs through the `storage` event or `BroadcastChannel`.
- Session counts remain estimates and are never conflated with daily visits.

That extra state and request volume are not justified for the stated basic reporting goal.

## Proposed architecture

```text
Website provider
  -> privacy + storage adapter
  -> once-daily visit gate / small event queue
  -> same-origin POST /api/analytics/events
  -> strict shared ingestion handler
  -> HMAC visitor key + validation + quality flags
  -> Postgres visitor-day staging + analytics events
  -> daily Trigger.dev aggregation/purge
  -> existing owner analytics email

API business mutation
  -> shared server event writer
  -> Postgres analytics events (no browser/network round trip)
```

Recommended package boundaries:

- `packages/events/src/events.ts`: typed canonical event definitions and allowed property schemas.
- `packages/events/src/client/*`: privacy signals, storage adapter, daily gate, queue, transport, and React provider/hooks.
- `packages/events/src/server/*`: ingestion parsing, visitor-key derivation, internal event writer, and aggregation query helpers.
- `apps/website/src/app/api/analytics/events/route.ts`: thin same-origin POST adapter.
- Dashboard anonymous ingestion should not be added initially. Existing client-only funnel events that occur before server confirmation can use a dashboard route later if they remain important.
- `packages/db`: Prisma models/migration for visitor-day staging, events, and daily rollups.
- `packages/jobs`: aggregation, retention cleanup, and replacement of OpenPanel report fetches.

Next.js Route Handlers use the standard Web `Request`/`Response` APIs and support `POST` directly ([Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)). Keep the domain logic in the shared package so framework adapters stay small and testable.

## Event contract

Use a versioned envelope and a strict allowlist rather than arbitrary OpenPanel-style property bags:

```ts
type ClientAnalyticsBatchV1 = {
  schemaVersion: 1;
  visitorId?: string;
  events: Array<{
    eventId: string;
    name:
      | "site_visit"
      | "cta_clicked"
      | "join_free_beta_clicked"
      | "pricing_viewed"
      | "pwa_install_clicked"
      | "pwa_install_accepted"
      | "pwa_install_failed"
      | "signup_started";
    occurredAt: string;
    visitorStatus?: "new" | "returning" | "unknown";
    properties?: Record<string, boolean | number | string | null>;
  }>;
};
```

Canonical persisted fields:

| Field | Rule |
| --- | --- |
| `eventId` | Client-generated random UUID; globally unique constraint for idempotency |
| `schemaVersion` | Required integer; reject unsupported major versions |
| `name` | Lowercase `snake_case` from a closed registry |
| `source` | Server-assigned `website_client`, `dashboard_client`, or `api_server` |
| `occurredAt` | Client time for ordering; clamp/reject implausible values |
| `receivedAt` | Server-assigned canonical receipt time |
| `origin` | Server-derived and allowlisted, never trusted from JSON |
| `routeKey` | Normalized allowlisted route such as `/`, `/pricing`, `/signup`; no query string |
| `visitorKey` | Server-side HMAC of `origin + visitorId`; raw visitor ID is discarded |
| `visitorStatus` | Client hint: `new`, `returning`, or `unknown` |
| `userId` / `workspaceId` | Set only by trusted authenticated server context |
| `referrerHost` | Host/category only; no path or query |
| `utm*` | Optional allowlisted values with short maximum lengths; strip unexpected keys |
| `properties` | Per-event schema, bounded key count/value lengths, no free-form nested data |
| `trafficQuality` | Server-assigned `likely_human`, `suspected_bot`, `internal`, or `unknown` |

Never accept identity or workspace IDs from the anonymous client payload. Never include customer IDs, customer contact details, search text, form values, error stack traces, or message contents.

### Keep the event catalog small

Initial website client events:

- `site_visit` (maximum once per Lagos day)
- `cta_clicked`
- `join_free_beta_clicked`
- `pricing_viewed` only on a deliberate pricing interaction, not every render
- the minimal PWA install outcome events that remain operationally useful
- `signup_started` if it cannot be represented by a server request

Trusted server outcome events:

- `signup_completed`
- `workspace_created`
- `customer_created`
- `service_job_created`
- `follow_up_created`
- `follow_up_status_updated`
- `message_sent`
- billing lifecycle events

Review each event with one question: “What decision changes if this count moves?” Remove events without a named decision or owner.

## Delivery: `sendBeacon` versus `fetch keepalive`

Use both, for different moments:

1. **Normal delivery:** `fetch()` a same-origin JSON batch, observe the response, and retry only transient failures with bounded exponential backoff and jitter.
2. **Page going hidden:** on `visibilitychange` when `document.visibilityState === "hidden"`, call `navigator.sendBeacon()` with the remaining small batch. MDN recommends `visibilitychange` for this use and warns that `unload`/`beforeunload` are unreliable and can harm the back/forward cache; `pagehide` is only a fallback ([MDN `sendBeacon()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)).
3. **Beacon unavailable/rejected:** `sendBeacon()` returns `false` when it cannot queue the payload. Fall back to `fetch()` with `keepalive: true`.
4. **Need headers or response:** use `fetch keepalive`; Beacon is POST-only, does not allow custom request properties, and exposes no response callback ([W3C Beacon specification](https://www.w3.org/TR/beacon/)).

Keep every batch comfortably below 16 KiB and at most ten events. Fetch keepalive bodies are limited to 64 KiB ([MDN `RequestInit.keepalive`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit#keepalive)), and Beacon payload capacity is user-agent constrained. This also limits abuse and server work.

Do not build an offline analytics queue in the MVP. Beacon provides no special offline storage or later delivery guarantee ([W3C Beacon specification](https://www.w3.org/TR/beacon/)). Losing a few low-value analytics events is preferable to adding IndexedDB/service-worker complexity and surprise delayed tracking.

## Ingestion, deduplication, and abuse controls

The endpoint is public. An attacker can copy the payload shape and origin headers, so no browser-shipped “API key” can make it trusted.

Apply these controls in order:

1. Accept only `POST`; return `204` for accepted or duplicate batches.
2. Require a supported content type and reject bodies over 16 KiB before parsing.
3. Require one to ten events, bounded strings, strict timestamps, a known schema version, known event names, and event-specific properties.
4. Derive origin/source from the request; allow only production afterservice origins. Treat `Origin`/`Referer` checks as noise reduction, not authentication.
5. Ignore or overwrite all server-owned fields.
6. Derive the HMAC visitor key with a server-only secret; never log the incoming visitor ID or request body.
7. Clamp `occurredAt` to a small acceptable skew and use `receivedAt` for retention/report windows.
8. Insert event IDs under a unique constraint and use conflict-ignore semantics. PostgreSQL `ON CONFLICT DO NOTHING` is designed to avoid duplicate insert errors ([PostgreSQL `INSERT`](https://www.postgresql.org/docs/current/sql-insert.html)); Prisma `createMany({ skipDuplicates: true })` maps to supported databases such as PostgreSQL ([Prisma CRUD documentation](https://www.prisma.io/docs/orm/prisma-client/queries/crud#create-multiple-records)).
9. Upsert the visit staging row under unique `(visitorKey, origin, reportDate)` so parallel tabs and retries count once.
10. Rate-limit the route by source at the edge. Vercel WAF supports fixed-window IP/JA4 rate limits on all plans, though usage has separate pricing, so confirm current project cost before enabling ([Vercel WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)). If not enabled, retain strict body/event limits and add a durable application limiter before traffic makes abuse costly.
11. Track accepted, rejected, duplicate, rate-limited, and processing-failure counters without copying rejected payloads into logs.

OWASP recommends maximum sizes for inputs/payloads and limits on how often clients can call an API to prevent unrestricted resource consumption ([OWASP API4:2023](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/)). Hono also provides body-limit middleware that checks `Content-Length` or the streamed body, which is useful if the shared API adapter owns ingestion ([Hono body-limit middleware](https://hono.dev/docs/middleware/builtin/body-limit)).

Client retries:

- Retry network errors, `408`, `425`, `429`, and `5xx` at most twice in the live page.
- Do not retry other `4xx` responses.
- Reuse the same `eventId` on every retry.
- Respect `Retry-After` when present.
- Never create an unbounded persistent retry queue.

## Bot and internal traffic

There is no perfect cheap bot detector. Client JavaScript excludes many simple crawlers, but headless browsers and malicious clients can run or imitate it. User-agent detection is unreliable and spoofable ([MDN on UA sniffing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent)); even Google recommends IP-range or forward/reverse-DNS verification rather than trusting a claimed Googlebot user-agent ([Google crawler verification](https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests)).

Recommended policy:

- Disable analytics in local, test, and preview environments by default.
- Tag authenticated events from QA-classified workspaces/accounts as `internal` and exclude them from owner metrics.
- Provide an owner-only local opt-out/internal marker for production website checks.
- Exclude health checks and synthetic-monitor routes explicitly.
- Apply a conservative known-bot UA heuristic at ingestion, but **tag** suspected bot records instead of deleting them immediately.
- Use hosting/WAF bot signals if already available, but do not add a paid bot product solely for this MVP.
- Report `likely_human` by default and retain a separate suspected-bot count so filters can be audited.
- If bot volume becomes material, verify major search crawlers using published IP ranges asynchronously; do not perform DNS lookups in the request path.

## Privacy and consent

### Persistent local IDs are tracking technology

Moving analytics first-party does not make it exempt from privacy law. The UK ICO explicitly treats local storage as a storage/access technology, whether first- or third-party, client- or server-side ([ICO: what are storage and access technologies?](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-storage-and-access-technologies/)). A random visitor ID and its event history are pseudonymous, not automatically anonymous.

Nigeria's Data Protection Commission identifies lawful/fair/transparent processing, purpose limitation, data minimisation, storage limitation, and security as core NDP Act principles ([NDPC 2026 journal summary](https://ndpc.gov.ng/wp-content/uploads/2026/02/NDPC-Journal-2026-1.pdf)). More specifically, Article 19 of the NDPC's 2025 General Application and Implementation Directive says non-necessary cookies require freely given, informed, specific consent with a conspicuous accept/reject choice, purpose and controller disclosure, and withdrawal information; it applies the same rules to personal-data tracking tools that perform cookie-like functions ([NDPC NDP Act GAID 2025, Article 19](https://ndpc.gov.ng/wp-content/uploads/2025/07/NDP-ACT-GAID-2025-MARCH-20TH.pdf)). A persistent local-storage visitor ID is such a tracking mechanism in substance. Before launch, afterservice should document the processing, explain it in the privacy notice, minimize fields, set retention, and provide a contact/path for data-rights requests. This document is technical research, not legal advice.

### Recommended configurable privacy gate

Implement one policy function rather than scattering checks:

```ts
type AnalyticsPermission = "allow" | "deny" | "undecided";
```

Inputs should include:

- explicit afterservice analytics preference;
- deployment environment;
- `navigator.globalPrivacyControl` and the server-side `Sec-GPC: 1` signal;
- deprecated `navigator.doNotTrack === "1"` as a voluntary courtesy signal;
- an application policy mode chosen after legal review.

Support two deployment policies in the library so the legal decision remains explicit rather than accidental:

1. `consent_required`: do not read/create the visitor ID or emit optional client analytics until opt-in.
2. `aggregate_notice_and_opt_out`: only for jurisdictions and a design confirmed to satisfy an analytics/statistical exception; show clear information and a simple free objection mechanism.

The current UK ICO guidance recognizes a statistical-purpose exception for analytics intended solely to improve the service, but requires aggregate outputs, clear information, a simple/free objection mechanism, no individual profiling/decisions, and deletion of personal data after it is needed for aggregation ([ICO statistical-purpose exception](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/)). That exception is narrow and jurisdiction-specific; it does not override Nigeria's GAID for Nigerian data subjects. Ship afterservice with `consent_required`. Enable any broader mode only after counsel has approved the exact jurisdictions, visitor routing, disclosure, objection mechanism, and processing design.

GPC is specifically a request not to sell/share personal information or use it for cross-context advertising; it is not a universal request to stop all same-context collection ([W3C GPC draft](https://www.w3.org/TR/gpc/)). afterservice does not need sale, sharing, or ad targeting. Still, the simplest trust-preserving product policy is to treat GPC as an analytics opt-out and document that choice. The older DNT mechanism is deprecated and discontinued, but honoring `DNT: 1` as the same courtesy opt-out costs little ([MDN `Navigator.doNotTrack`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/doNotTrack)).

When permission becomes `deny`:

- stop queueing and sending optional client analytics;
- clear the local analytics visitor state and pending in-memory batch;
- keep essential authentication/security/transaction records under their own documented purposes;
- do not claim that clearing local state deletes already aggregated anonymous statistics;
- offer a clear “Analytics preferences” control from the privacy page/footer.

### Data minimization rules

Collect:

- normalized route category;
- event name;
- receive time;
- new/returning/unknown hint;
- coarse referrer host/category and allowlisted UTM values only when needed;
- internal user/workspace IDs only for trusted authenticated product events;
- coarse device class only if a concrete product decision requires it.

Do not collect:

- IP addresses at rest (use transient request data for abuse controls only);
- raw user-agent, exact device model, screen dimensions, fonts, or fingerprint components;
- exact location;
- full URL, query string, fragment, or full referrer path;
- email, name, phone, customer IDs/details, search terms, form text, message contents, or error payloads;
- cross-site or cross-device identifiers.

## Storage, aggregation, and retention

Recommended logical models:

### `AnalyticsVisitDay` (short-lived staging)

- `id`
- `eventId` (unique)
- `visitorKey`
- `origin`
- `reportDate` (Africa/Lagos date)
- `visitorStatus`
- `routeKey`, `referrerCategory`, allowlisted campaign dimensions
- `trafficQuality`
- `receivedAt`
- unique `(visitorKey, origin, reportDate)`

### `AnalyticsEvent` (bounded raw events)

- `id/eventId`, `schemaVersion`, `name`, `source`
- `occurredAt`, `receivedAt`
- nullable `visitorKey`, `userId`, `workspaceId`
- normalized/allowlisted dimensions and a small validated JSON property object
- `trafficQuality`
- indexes on `(receivedAt, name)`, `(workspaceId, receivedAt)`, and `(visitorKey, receivedAt)` where useful

Analytics is explicitly global platform telemetry, so anonymous rows are not workspace-scoped. Authenticated product events remain workspace-scoped where applicable. This exception to the repository's normal workspace rule should be recorded in the eventual schema docs/ADR.

### `AnalyticsDailyRollup` (longer-lived aggregate)

- `reportDate`, `origin`, `metric`, and bounded dimension keys
- `value`
- unique composite key for idempotent daily aggregation
- no visitor, user, workspace, IP, or raw event identifier for public traffic rollups

Retention recommendation:

- Anonymous visit/event rows: aggregate daily; delete seven days after successful rollup. This window permits reruns and debugging without maintaining a long visitor history.
- Authenticated product analytics: 90 days initially, provided the privacy notice/lawful basis covers it; operational domain records remain governed by their own retention policies.
- Daily non-identifying rollups: 13 months, then review whether year-over-year value justifies continued storage.
- Rejected payloads: do not store. Keep only aggregate rejection counters.
- Local visitor state: expire/reset after 13 months without an eligible visit; renew `lastSeenAt` only when analytics is allowed.

Retention must be an automated job with observable success/failure, not a policy comment. The owner report should flag stale aggregation or purge jobs. The NDPC's GAID requires data to be kept no longer than necessary, a clear retention policy, destruction or irreversible de-identification of unneeded residue, and communication of retention to data subjects ([NDPC NDP Act GAID 2025, Schedule 1](https://ndpc.gov.ng/wp-content/uploads/2025/07/NDP-ACT-GAID-2025-MARCH-20TH.pdf)).

## Daily reporting

Replace OpenPanel sections in the existing `daily-analytics-review` task with local queries for the previous Africa/Lagos day:

- daily visitors;
- new / returning / unknown visitors;
- previous-day and previous-seven-day comparison;
- accepted / duplicate / suspected-bot / internal counts;
- top landing route categories, referrer categories, and UTM sources when present;
- key website funnel events and conversion ratios;
- trusted product outcome events alongside the existing platform database metrics;
- ingestion, aggregation, or cleanup health warnings.

Do not reproduce OpenPanel dimensions merely because they were previously available. Country, detailed browser/OS, and page-by-page histories should remain out unless a concrete decision needs them.

## Implementation plan

### Phase 0 — approve definitions and privacy posture

1. Approve “active visitor-day” as the meaning of website visit.
2. Decide whether the launch mode is `consent_required` or a legally reviewed aggregate notice/opt-out mode.
3. Approve seven-day anonymous raw retention and 13-month rollup/local-state retention.
4. Approve the initial event allowlist and name the decision owner for every event.
5. Record an ADR for the first-party analytics architecture and the global-telemetry database exception.

### Phase 1 — contracts and pure client logic

1. Replace OpenPanel types in `@afterservice/events` with project-owned versioned types and per-event property schemas.
2. Normalize existing display-style names such as `"CTA Clicked"` to canonical wire names such as `cta_clicked`; maintain a temporary mapping during migration.
3. Implement and unit-test the privacy policy function.
4. Implement and unit-test a defensive local-storage adapter, corruption recovery, expiry, new/returning classification, and Lagos date calculation.
5. Implement an in-memory bounded queue and transport with reused event IDs.

### Phase 2 — database and trusted server writer

1. Add the three logical models and necessary unique constraints/indexes.
2. Add server-only HMAC visitor-key derivation with a dedicated secret and redaction rules.
3. Add an internal server writer that accepts identity/workspace only from trusted API context and writes directly to Postgres.
4. Make duplicate insertion a successful no-op.
5. Update Brain database schema, relationships, and migrations docs.

### Phase 3 — public website ingestion

1. Add the thin same-origin Next.js POST Route Handler.
2. Enforce content type, 16 KiB body size, one-to-ten event batch, strict schema, allowed origin, timestamp skew, and server-owned fields.
3. Upsert one visitor-day and insert explicit events transactionally where practical.
4. Add rate limiting and aggregate health counters.
5. Verify that request bodies and raw visitor IDs never appear in application/platform logs.

### Phase 4 — website provider

1. Replace `OpenPanelComponent` with the project provider while preserving the current `useTrack()` call shape long enough to avoid a wide component rewrite.
2. Mount the once-daily visitor gate on the website only.
3. Remove automatic screen-view, attribute, and outgoing-link tracking.
4. Batch explicit events, use fetch normally, and flush on `visibilitychange` via Beacon/keepalive.
5. Add the analytics preference UI, state reset, GPC/DNT behavior, and privacy-page disclosure.

### Phase 5 — trusted product events

1. Replace `setupAnalytics()` network calls in API mutations with the internal database writer.
2. Confirm that completed outcomes are not double-counted by both optimistic client events and server events.
3. Tag QA workspaces/accounts as internal.
4. Keep client-only intent events only where they answer a real funnel question.

### Phase 6 — rollups, retention, and report

1. Add an idempotent daily rollup job for the previous Lagos date.
2. Add anonymous and authenticated retention cleanup.
3. Replace OpenPanel Insights calls and environment requirements in `analytics-review.ts` with local rollup queries.
4. Add job-health warnings and rerun safety.
5. Update Brain observability, jobs feature, API, and analytics behavior docs.

### Phase 7 — parallel verification, then removal

1. In a short production verification window, write first-party metrics while OpenPanel remains enabled.
2. Compare broad trends, not exact equality; cadence, blockers, bot filters, and definitions differ.
3. Confirm one daily visit per browser/day, new-to-returning transition, multi-tab dedupe, consent/opt-out, GPC/DNT, storage failures, retry dedupe, and QA exclusion.
4. Confirm owner report delivery and successful purging.
5. Remove `@openpanel/nextjs`, OpenPanel environment variables, read credentials, Insights code, provider components, and OpenPanel-specific docs only after acceptance passes.

### Phase 8 — post-launch review

After 30 days, review:

- request/database volume and cost;
- rejection/duplicate/bot rates;
- missing or unused events;
- report decisions actually made;
- retention job evidence;
- whether any additional dimension is justified.

Prefer removing data over expanding collection by default.

## Verification matrix

| Scenario | Expected result |
| --- | --- |
| First eligible visit | One `site_visit`, status `new` |
| Reload or client navigation same day | No additional `site_visit` |
| Next Lagos day | One `site_visit`, status `returning` |
| Two tabs race | One visitor-day after database uniqueness |
| Storage unavailable/corrupt | Site works; visitor status `unknown` or analytics disabled; no exception escapes |
| Private browsing ends | Later private session may appear new; documented limitation |
| Consent undecided in required mode | No visitor ID read/created and no optional event sent |
| Consent withdrawn | Queue/state cleared; future optional events suppressed |
| `Sec-GPC: 1`, `navigator.globalPrivacyControl === true`, or `DNT: 1` | Optional analytics suppressed under recommended policy |
| Beacon queues successfully | No duplicate effect when ordinary retry later occurs |
| Same event ID retried | One stored event |
| Oversized/unknown payload | `400`/`413`; no database write; aggregate rejection counter increments |
| Client submits user/workspace fields | Fields rejected/ignored; server context remains authoritative |
| Local/preview environment | No production analytics writes |
| QA workspace event | Stored/tagged internal and excluded from owner metrics |
| Suspected crawler | Tagged separately, not silently destroyed |
| Aggregation rerun | Same rollup values; no double counting |
| Purge job | Eligible raw rows deleted only after successful rollup |

## Caveats and explicit non-goals

- The metrics are directional, not an auditable source of truth.
- A visitor ID represents one browser storage area, not a person.
- Ad blockers and privacy tools will cause under-counting; storage resets will cause over-counting of new visitors.
- Public analytics can be forged even with origin checks and rate limits.
- Beacon/keepalive improve page-exit delivery but do not guarantee receipt.
- Anonymous website history will not be joined across website/dashboard, browsers, or devices.
- No fingerprinting, ad attribution network, replay/session recording, heatmaps, cross-site tracking, or user-level behavior profiles are proposed.
- The UK statistical-purpose exception cited here may not apply to afterservice's actual processing or every visitor jurisdiction; legal review remains required.

## Primary resources

- [MDN: `Window.localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [MDN: `Crypto.randomUUID()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID)
- [MDN: `Navigator.sendBeacon()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)
- [W3C: Beacon specification](https://www.w3.org/TR/beacon/)
- [MDN: Fetch `keepalive`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit#keepalive)
- [W3C: Global Privacy Control draft](https://www.w3.org/TR/gpc/)
- [MDN: deprecated Do Not Track API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/doNotTrack)
- [ICO: storage and access technologies](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-storage-and-access-technologies/)
- [ICO: analytics/statistical-purpose exception](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/)
- [Nigeria Data Protection Commission: NDP Act resources](https://www.ndpc.gov.ng/ndp-act-2023/)
- [Nigeria Data Protection Commission: NDP Act GAID 2025](https://ndpc.gov.ng/wp-content/uploads/2025/07/NDP-ACT-GAID-2025-MARCH-20TH.pdf)
- [Next.js: Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Next.js: Backend for Frontend and public endpoint guidance](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [Hono: body-limit middleware](https://hono.dev/docs/middleware/builtin/body-limit)
- [OWASP API Security: unrestricted resource consumption](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/)
- [PostgreSQL: `INSERT ... ON CONFLICT`](https://www.postgresql.org/docs/current/sql-insert.html)
- [Prisma: bulk create and duplicate skipping](https://www.prisma.io/docs/orm/prisma-client/queries/crud#create-multiple-records)
- [Vercel: WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)
- [Google: verify crawler requests](https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests)
