# QA purge contract

- Start requires a fresh signed preview and exact `PURGE ALL QA DATA`
  confirmation.
- Active subscriptions block the run. Durable output contains aggregate counts
  only.

# QA accelerator contract

- Contract version is `1`; version skew fails with `upgrade_required` before
  credential exchange.
- Availability requires local/development/preview mode, an explicit enabled
  flag, a secret of at least 32 characters, and at least one exact configured
  `.test` email route.
- Browser capability and mutation requests must match an exact origin in
  `QA_ACCELERATOR_ALLOWED_ORIGINS`; forged or missing mutation origins fail
  closed.
- QA domain and tester credential are separate request fields. Raw credentials,
  authorization tokens, client IDs, and profile references are never persisted.
- Authorization lasts at most 12 hours, profile references 10 minutes, and
  derived sessions 8 hours; grant expiry is always the upper bound.
- Five failed exchanges in a 15-minute bucket lock that client/network bucket
  for 30 minutes.
- The client bucket is always present. A deployment may additionally opt into a
  proxy-sanitized `x-real-ip` or `cf-connecting-ip` network bucket; generic
  forwarded headers are rejected.
- Profile responses expose ordinary identity/workspace labels plus an opaque
  single-use reference; they do not expose membership or workspace IDs as a
  selection authority.
- Revocation invalidates all authorization-derived sessions.
- Quick Fill receives only `{ qaDomain, seed }`, changes form state, and never
  submits a mutation.

## Analytics country forwarding — 2026-10-24

`POST /api/analytics` on website/dashboard preserves the existing bounded batch,
project key, origin checks and collector status. The server route now forwards
country through `x-logly-country` using the trusted product-edge policy in
`brain/features/visit-country-tracking.md`. Country is not accepted in the
event body, derived from language, or inferred from the collector's network.
Logly owns country normalization, persistence, deduplication and reads; no
Afterservice database/API business contract changes are required.
