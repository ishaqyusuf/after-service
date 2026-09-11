# 0009: Use Logly As Shared First-Party Analytics

## Status

Accepted on 2026-08-31.

## Context

Afterservice used OpenPanel for browser events, trusted product events, and its
daily owner report. The first replacement plan proposed rebuilding the generic
collector and storage inside Afterservice.

Codex task `01a05499-12a0-7b32-ae20-05f760da6e58` established a better
cross-project boundary: one small shared service with reusable browser,
Next.js, and server packages. Logly now implements that platform shape.

## Decision

Use Logly as the central first-party analytics platform and Afterservice as its
first pilot.

`@afterservice/events` stays as a thin domain event wrapper. Browser events use
an Afterservice same-origin route before reaching Logly. Trusted events use the
Logly server package. Afterservice installs stable Logly packages rather than
copying SDK code or creating analytics tables.

Logly API keys are project-scoped by purpose: `client-ingest`, `server-write`,
`read`, and `admin`. Secrets remain server-only and are stored as hashes by
Logly. Visitor and actor keys are isolated per project; no cross-project
identity is created.

## Alternatives

- Building analytics inside Afterservice was rejected because it duplicates
  infrastructure and leaks Afterservice concepts into a generic capability.
- Continuing OpenPanel was rejected because the small event/visitor requirement
  does not justify another subscription.
- Direct browser-to-collector delivery was rejected in favor of a same-origin
  route that keeps configuration and credentials server-side.
- Shared cross-product identity was rejected as unnecessary cross-site tracking.

## Consequences

- Logly owns generic collection, persistence, retention, reads, and dashboard.
- Afterservice owns typed event helpers, its enablement/privacy decision, route
  configuration, and product-specific report composition. Logly accepts and
  discovers valid bounded event names automatically; project creation does not
  require a synchronized catalog.
- Logly packages are published as coordinated npm `0.2.0` releases under the
  `@ishaqyusuf` scope and Afterservice uses normal registry dependencies in
  production.
- Optional analytics failure must never affect product behavior.
- Browser collection remains disabled until the explicit environment switch is
  enabled. The same switch may be enabled in a local profile to test against a
  local Logly collector; environment type alone does not override it.
