# Standalone API deployment contract

Oversight v1 (2026-10-24): private summaries use 7/30/90 UTC days and explicit
project identity; directories use bounded search and 50-row keyset pages.
QA/purging workspaces are excluded. Legacy `orders` fields represent service
jobs. Job currency and unset amounts remain null. All responses are `no-store`;
unavailable data returns sanitized 503. See `brain/features/oversight-integration.md`.

Production email precondition (2026-10-18): `followUps.markSent` returns
`PRECONDITION_FAILED` when email delivery has no Trigger key or production has
a development key. It leaves status, sent timestamp, logs, and events unchanged.
An email queue rejection returns `BAD_GATEWAY` with a bounded retry message and
also leaves those records unchanged. Sent state is written only after Trigger
accepts the dispatch; acceptance does not establish provider delivery.

- Public API base is `https://api.afterservice.app`, without an implicit `/api` suffix.
- `/trpc/*` and `/api/trpc/*` both preserve tRPC's response envelopes.
- Credentialed CORS returns an allow-origin header only for exact trusted origins,
  including preflight requests on both tRPC mounts. Unknown origins receive no allow-origin header.
- Browser OAuth stays at `https://dash.afterservice.app/api/auth/callback/google`.
- Dashboard, marketing server routes, and the API use the same production auth signing secret.
- `bun run smoke:api` verifies public routes, anonymous authentication and permission
  failures, CORS allow/deny behavior, and production QA route absence without mutations.

# MVP validation and manual-contact contract

- The scheduled `GET /api/jobs/follow-ups/mark-missed` requires `CRON_SECRET`
  through a bearer token or `x-cron-secret`. Missing configuration returns 503;
  absent/invalid credentials return 401, and query parameters return 400.
  All responses disable caching. It marks strictly overdue open/scheduled
  records missed, is repeat-safe, and invokes no messaging provider. The POST
  dry-run endpoint retains its scoped clock/workspace/markMissed options.

- Optional follow-up job/template/member references must resolve inside the
  session workspace. A related job must also match the selected customer.
  Invalid relationships return `NOT_FOUND` before any record/event writes.
- Logging a phone follow-up atomically writes sent status, one phone
  `MessageLog`, and a `followup_message_sent` event. It invokes no provider.
- Authenticated cron requests with malformed JSON return `400`. Invalidly signed
  webhooks return `401`; signed malformed webhook JSON or invalid envelope
  shapes return `400` before billing-event persistence.
- Existing billing-event idempotency and webhook-only entitlement updates remain
  enforced by the integration suite.

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

# Operator calendar queries (2026-10-19)

`followUps.listBoard` and `dashboard.overview` accept optional
`{ timeZone?: string }`. The zone must be recognized by `Intl.DateTimeFormat`
(maximum 100 characters); invalid zones return `BAD_REQUEST`. Omitted input or
zone uses UTC. The dashboard explicitly requests its browser timezone after
hydration and includes it in the query cache key. This changes presentation
calendar boundaries only; saved due instants and cron's absolute clock remain
unchanged. Board stages are mutually exclusive; sent items remain Waiting.

## Assistant Reviewed Actions — 2026-10-24

Confirmation binds proposal ID/revision/digest and expected target versions,
rechecks current scope/role/limits/rollout, and atomically saves the canonical
business command plus unique receipt. Repeated confirmation returns the same
receipt; stale/canceled/expired drafts refuse execution. Model tools cannot
confirm. Server-only operation context supplies a transaction, record-only mode
and after-commit analytics; client input cannot set those fields. Scheduling
through assistant emits no outbound notification. Email is a form handoff.
Amounts convert exactly to integer cents and retain an explicit per-job currency.

The model-only `draftAction` tool accepts `{ proposal: AssistantAction }` to meet
the provider's object-root schema requirement. Public tRPC draft/edit inputs keep
the typed action contract. Runs persist prompt version; proposal capability
version must still match on confirmation. Provider error bodies and SDK request
objects are never logged.
