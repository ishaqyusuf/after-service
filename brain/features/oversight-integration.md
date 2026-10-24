# Oversight operational reads

Updated: 2026-10-24

## Purpose

Show Afterservice business adoption and service activity in the existing private
Oversight portfolio desk. Logly remains the traffic/event system. Neither system
alone establishes real operator activation.

## Contract

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
