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
