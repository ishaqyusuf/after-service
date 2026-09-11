# Plan: Replace OpenPanel With Logly

## Status

Implemented and production-verified as of 2026-09-01.

## Decision Context

Codex task `01a05499-12a0-7b32-ae20-05f760da6e58` established that the user’s
minimal analytics capability should be one reusable, standalone system for all
projects. Logly at `/Users/M1PRO/Documents/code/logly` is that system.

This supersedes the earlier Afterservice-local collector/database design.
Afterservice is the first pilot and remains a thin product adapter.

## Objective

Remove OpenPanel from Afterservice and use the installable Logly SDK packages
and hosted collector for minimal visitor-day and explicit event analytics.

## Architecture

```text
afterservice browser
  -> @afterservice/events typed compatibility wrapper
  -> same-origin /api/analytics route
  -> @ishaqyusuf/logly-next route adapter
  -> central Logly collector and Postgres

afterservice API
  -> @afterservice/events server wrapper
  -> @ishaqyusuf/logly-server
  -> central Logly collector
```

Logly owns generic schemas, visitor state, batching, delivery, project
isolation, scoped keys, persistence, reads, aggregation, retention, and the
shared dashboard. Afterservice owns typed event helpers, its enablement/privacy
decision, thin route configuration, and product-specific reporting composition.
Logly validates and discovers event names from authenticated ingestion, so no
project-setup catalog is synchronized with application code.

## Thin Replacement Boundary

- Do not create analytics tables or ingestion logic in Afterservice.
- Do not copy or fork the Logly SDK into Afterservice.
- Keep `@afterservice/events` as a small typed wrapper so existing `Provider`,
  `useTrack()`, and `setupAnalytics()` call sites migrate without broad churn.
- Install `@ishaqyusuf/logly-core`, `@ishaqyusuf/logly-next`, and
  `@ishaqyusuf/logly-server` from npm. A future npm organization migration
  uses new package names because npm user-scoped packages cannot be transferred
  directly to an organization scope.
- Packed `.tgz` files were used only for pre-release validation. Production and
  the committed lockfile use the published npm `0.2.0` packages.

## API Key Contract

- `client-ingest`: project-scoped key held only by the same-origin route.
- `server-write`: project-scoped key held only by trusted backend code.
- `read`: scoped key for Afterservice reporting reads.
- `admin`: reserved for Logly project and key administration.
- Logly stores project keys as hashes and supports expiry/revocation.
- No secret key is exposed through `NEXT_PUBLIC_*` variables.
- Browser code knows only the project slug and same-origin endpoint.

## Measurement And Privacy

- One `site_visit` per eligible browser per Africa/Lagos date.
- First eligible day is `new`; a later eligible day is `returning`.
- No automatic pageviews, DOM capture, outgoing-link tracking, replay,
  heatmaps, fingerprinting, location, or detailed device collection.
- Visitor storage and collector HMAC keys are project-isolated; no
  cross-project identity exists.
- Never send email, name, phone, customer data, form values, search text,
  message content, full URLs/query strings, IP addresses, or raw user agents.
- Local, test, preview, QA, GPC, and DNT paths suppress optional collection.
- Production remains disabled until explicit enablement and privacy preference
  requirements are satisfied.

## Initial Event Budget

Website events: `site_visit`, CTA/join-beta/pricing intent, and the existing PWA
install lifecycle events.

Trusted outcomes are limited to events that add value beyond existing domain
tables. Afterservice tables remain authoritative for users, workspaces,
customers, jobs, follow-ups, messages, and billing.

## Implementation

1. Make the three Logly SDK packages publish-ready and verify their packed
   manifests rewrite `workspace:*` dependencies to real versions.
2. Publish them to an approved npm scope or another stable package source.
3. Replace `@openpanel/nextjs` in `@afterservice/events` with thin Logly wrapper
   dependencies and lower-case event names.
4. Add the website same-origin route and mount browser analytics only on the
   public website.
5. Remove dashboard identity/group plumbing and raw workspace identifiers.
6. Replace trusted server tracking with the Logly server package.
7. Replace OpenPanel Insights reporting with basic Logly read data; remove
   unsupported pageview/session/bounce/country/device sections.
8. Remove active OpenPanel environment/configuration references and regenerate
   `bun.lock` with Bun.
9. Run package tests, targeted typechecks/lint/build, a repository reference
   scan, and an opt-in browser smoke test.
10. Run Afterservice and Logly concurrently through shared local-infra profiles,
    send an uncatalogued event through the Afterservice same-origin route, and
    verify it under the selected Logly organization/project before production
    deployment.

## Acceptance Criteria

- No active Afterservice runtime dependency or import references OpenPanel.
- Afterservice uses published/stable Logly packages, not copied SDK code.
- Browser delivery is same-origin and secrets remain server-only.
- Project-scoped keys are used for client ingestion, server writes, and reads.
- New/same-day/returning behavior and validation are covered by tests.
- Analytics failure never fails navigation or a product mutation.
- Collection stays disabled until the explicit enable switch is set; local QA
  may enable it with local-only keys and collector URLs.
- A new valid event name sent through the local Afterservice route appears in
  Logly without event-catalog setup.

## Verification Status

- `bun run smoke:logly:local` passes against the concurrent Docker/Portless
  stacks and proves unique event round-trip through the product route and scoped
  Logly read API.
- `@afterservice/events` has focused route/server coverage and passes test,
  typecheck, and lint against the packed `0.2.0` SDK candidate.
- `bun run smoke:mvp` passes with the local Trigger.dev worker, including
  creation of the queued notification `MessageLog`.
- `@ishaqyusuf/logly-core`, `@ishaqyusuf/logly-next`, and
  `@ishaqyusuf/logly-server` `0.2.0` are published and installed from npm.
- The dashboard and marketing Vercel projects are deployed, active OpenPanel
  variables were removed, and Chrome acceptance confirmed a browser
  `site_visit` plus uniquely named production smoke events in Logly without
  catalog setup.

## Deferred

- Integrate a second project to validate generic boundaries.
- Add richer Logly read filters, daily rollups, retention automation, and shared
  reports only when the thin pilot demonstrates the need.
- Review event usefulness and volume after 30 days; remove unused events before
  adding dimensions.
