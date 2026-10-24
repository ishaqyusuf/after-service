# Oversight operational reads

Updated: 2026-10-24

## Purpose

Show Afterservice business adoption and service activity in the existing private
Oversight portfolio desk. Logly remains the traffic/event system. Neither system
alone establishes real operator activation.

## Contract

Reporting-only internal/test exclusions are live under ADR 0024 and
`features/adoption-data-reconciliation.md`. Production reporting excludes the
four founder-confirmed internal/test workspaces. These exclusions do not change
QA classification or purge eligibility.

`GET /api/oversight/v1/summary?days=7|30|90` returns version 1, project ID
`afterservice`, a UTC period and daily registration/service-job series. Totals
include workspaces, users, new users/workspaces and jobs in the period, plus
all-time unarchived customers, follow-ups and currently overdue uncontacted work.
The legacy `orders` field means service jobs. All normal workspaces are counted
as active because Afterservice has no workspace suspension state.

`GET /api/oversight/v1/businesses|users|records` accepts a bounded search and an
opaque last-ID cursor. Pages contain at most 50 rows. Businesses map to
workspaces; users are operator accounts; records are service jobs. Directory
responses include workspace names, operator names/emails, service titles/status
and timestamps. Customer contacts, notes, drafts, message bodies and credentials
are not returned. Jobs have no stored currency, so currency remains null and an
unset amount remains null; Oversight displays the unknown state explicitly.

## Authorization and data boundaries

- Explicit `OVERSIGHT_ENABLED=true` and an independent read key of at least 32
  characters are required. The server checks bearer credentials before input
  validation or database initialization. Every response uses `no-store`.
- The lazy client requires `OVERSIGHT_DATABASE_URL`; there is no application DB
  fallback. It uses at most three connections, read-only transaction defaults,
  and a 15-second statement timeout. Provision a dedicated SELECT-only role for
  Workspace, User, Membership, Customer, ServiceJob and FollowUp.
- Summary executes in a repeatable-read, explicitly read-only transaction.
- QA and purging workspaces are excluded. Accounts with only QA/purging
  memberships are excluded. Accounts with no memberships remain visible.
- Classification is explicit. Unclassified test/founder data is still normal
  data; these counts must not be advertised as verified real customers.
- Data/configuration failure returns a sanitized 503, never zero metrics.
- Business status changes, campaigns and customer messaging are unavailable.
- Oversight requires its own matching server variables:
  `AFTERSERVICE_OPS_URL`, `AFTERSERVICE_OPS_READ_KEY`, and
  `AFTERSERVICE_OPS_ENABLED=true`. No integration key goes to the browser.

## Verification and rollout

Source implementation spans Afterservice and the sibling Oversight repository.
Afterservice auth/input/failure tests, real local PostgreSQL summary/directory
tests, API/DB typechecks, and API bundling passed. Oversight connector tests and
full typecheck passed. Production activation and browser acceptance are recorded
separately below when completed.

Initial live inspection: Afterservice is registered in Oversight but **Not
connected**. Direct read-only production inspection found four normal workspaces
and no explicitly classified QA workspaces; this is not four verified beta teams.

### Production activation completed

The user explicitly approved the exact persistent read scope, server credential
configuration and both deployments. The role
`afterservice_oversight_reader_20261024` passed direct 7/30/90-day summary and all
directory queries. Audit confirms read-only defaults, no auth Account access,
no customer email-column access, no table writes and no public-schema CREATE.
API and Oversight keys/connection settings are Vercel Production server values;
read key and database URL are Sensitive. No secret dotenv file was edited.

- API: `dpl_6iJFD7r51ubTaMfMeZ7sdGykJee5`, `https://api.afterservice.app`.
- Oversight: `dpl_247R3scm1EYKqPJWESR9sZxcg3rm`,
  `https://oversight.ishaqyusuf.com/overview?project=afterservice`.
- All six authenticated HTTP reads returned 200 and `Cache-Control: no-store`;
  unauthenticated summary returned 401. The ordinary API smoke suite passed.
- In-app production snapshot, 4 business rows, 7 user rows and 2 service-job
  rows passed. Desktop and 390×844 mobile had no captured console errors or
  warnings, and the mobile document had no horizontal overflow.
- Live totals: 4 normal workspaces, 7 operator accounts, 2 unarchived customers,
  2 jobs in the 30-day period, 5 all-time follow-ups and 2 overdue uncontacted
  follow-ups. QA/internal ownership still needs reconciliation.

An unrelated concurrent Polar dependency/import refactor caused the first
whole-repo cloud API build to fail. The successful release uses the previously
verified complete product bundle plus the latest Oversight router, with the
normal daily cron declaration preserved. The isolated artifact and hashes are
retained in `outputs/oversight-api-release-20261024/`. The billing refactor was
not published by this rollout. A future coherent source release can replace
the temporary artifact through the normal API deployment path.

### Zero-business user investigation — 2026-10-24

Read-only production reconciliation confirms all seven visible user counts
match the underlying memberships. Three registered accounts have zero total
memberships, including QA/purging memberships; their zeroes are not a reporting,
filtering, or pagination defect. Two of these accounts have verified emails;
one is unverified. Email verification alone does not establish a real operator
or active business.

Account registration and business setup are separate steps. Better Auth creates
the identity; successful `/api/onboarding` creates the workspace, owner
membership, and starter templates in one transaction. These three accounts
currently have no completed workspace setup. Existing records cannot establish
whether they abandoned onboarding, encountered an error, or previously had a
membership removed. Do not describe them as confirmed fake accounts or active
customers. The investigation itself changed no UI; the follow-up display change
is recorded below.

The four existing workspaces belong to the founder/admin identities and the
two documented production-verification identities. Their presence does not
prove that the three zero-membership registrants activated. Verification used
the live Oversight users/business directories and the actual reporting query
against production in an explicitly read-only, repeatable-read transaction;
all seven counts matched. No customer records, authentication credentials,
memberships, classifications, or deployments were changed.

### Users setup label — 2026-10-24

Oversight's users table now renders an outline “Setup incomplete” badge beside
an exact zero business count. Positive counts remain numeric. This uses the
existing business-membership field for each selected project and introduces no
API, schema, auth, or permission changes. It describes current membership state;
it does not establish why a user has no business or whether they once had one.

The source change is in Oversight's
`apps/dashboard/src/components/project-directory.tsx`. All seven Oversight
packages pass typechecking and the changed component passes Biome. A local
preview of the actual component with synthetic users verified counts of 0, 1,
and 3, the zero-only badge, and preserved unavailable/empty states. Screenshot:
`outputs/oversight-setup-label-20261024/users-preview.png`.

Production deployment `dpl_4d32yAWx1fUcmYnAFoGqm3MAqC8t` is Ready and promoted
to `oversight.ishaqyusuf.com`. The release reconstructs all 124 source files of
baseline `dpl_247R3scm1EYKqPJWESR9sZxcg3rm`, verifies each SHA-1, and changes
only the users-table component. Isolated seven-package typecheck, scoped Biome
and the Vercel build passed. The production alias was rechecked before promotion
and verified afterward. No migrations, env changes or product data writes ran.

Live browser acceptance confirms all three current Afterservice user rows have
zero businesses and display “Setup incomplete”. Matching search retains its one
badge; unmatched search shows “No results” with no badge. Search was cleared and
the original users URL restored. No captured console errors or warnings. Current
production has no positive-count Afterservice user in the reporting population;
positive counts were covered by the prior local preview, not a production fixture.
Release hashes, verification receipt and `users-production.png` are retained in
`outputs/oversight-setup-label-20261024/`.

### Internal/test exclusions activated — 2026-10-24

Founder confirmed all four existing workspaces are internal/test. Reporting-only
exclusions are live in API/dashboard (ADR 0024); no classification, data, auth or
purge eligibility changed. Live in-app acceptance verifies zero businesses,
zero service jobs and exactly three zero-membership registrants. Summary also
reports zero customers/follow-ups. API health is 200 and anonymous reads JSON 401.
See `adoption-data-reconciliation.md` for deployment IDs, provenance and tests.
