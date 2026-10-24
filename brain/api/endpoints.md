# Production API

Base URL: `https://api.afterservice.app`.

- `GET /health`: service health and configured public app URLs.
- `GET /api/oversight/v1/summary|businesses|users|records`: explicitly enabled,
  independent bearer-key-protected private portfolio reads (ADR 0017).
- `GET|POST /trpc/*` and `/api/trpc/*`: shared typed business router.
- `GET|POST /api/auth/*`: Better Auth handlers; browser OAuth remains on the dashboard origin.
- `POST /api/onboarding`: authenticated workspace onboarding.
- `POST /api/jobs/follow-ups/dry-run`: cron-secret-protected job endpoint.
- `GET /api/jobs/follow-ups/mark-missed`: secret-protected daily Vercel Cron
  endpoint; uses the server clock and accepts no query overrides.
- `POST /webhooks/lemon-squeezy`: signature-verified legacy billing webhook.
- Existing dashboard same-origin `/api/auth`, `/api/trpc`, and `/api/onboarding`
  handlers remain available.

# Platform QA maintenance

- `qaMaintenance.candidates`, `adopt`, `preview`, `start`, and `run` are
  platform-admin-only tRPC operations.

# Non-production QA accelerator

These Next route handlers are compiled only when a server-owned internal build
enables the accelerator. They are absent from production route artifacts.

- `GET /api/qa-access/capability?contractVersion=1`: returns versioned
  availability without exposing private configuration.
- `POST /api/qa-access/exchange`: exchanges an exact QA domain plus tester
  credential for an HttpOnly client authorization.
- `POST /api/qa-access/revalidate`: fails closed when authorization is expired,
  revoked, or unreachable.
- `GET /api/qa-access/profiles`: lists opaque, short-lived references for
  active QA workspaces matching the authorized domain.
- `POST /api/qa-access/select`: consumes one profile reference and writes an
  ordinary signed Better Auth session.
- `POST /api/qa-access/revoke`: revokes the client authorization and clears QA
  authorization and Better Auth session cookies.
- `GET /api/qa-access/fixture-context`: returns only an authorized QA domain and
  keyed non-secret fixture seed for pre-session and authenticated Quick Fill.
- `qaAccelerator.fixtureContext`: authenticated tRPC query exposing only the
  selected QA domain and deterministic non-secret fixture seed.
