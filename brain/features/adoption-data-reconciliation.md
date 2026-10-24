# Adoption data reconciliation

Updated: 2026-10-24
Status: reporting exclusions deployed; live Oversight summary verified as zero
external workspaces and three registrations. Business, user and service-job directory acceptance passed.

## Requested order

1. Separate internal/test workspaces and describe trustworthy adoption metrics.
2. Restore Trigger delivery and verify one delivered follow-up email.
3. Replace public privacy/terms placeholders and confirm the support channel.

All three stages are complete. Legal pages were published after founder
confirmation of operator, country and support ownership.

## Production inventory

Read-only, repeatable-read inspection of the confirmed production Neon host and
the live Oversight directories found:

| Workspace | Ownership/evidence | Reporting decision |
| --- | --- | --- |
| Zeroes & One | Founder-owned, no recorded jobs | Exclude as internal (founder confirmed) |
| Owner | Admin-owned, customer/follow-up records | Exclude as internal (founder confirmed) |
| Production Verification 2026-10-18 | Documented production acceptance fixture | Exclude as test |
| Browser Verification 2026-10-19 Updated | Documented browser acceptance fixture | Exclude as test |

Three other registrations have no memberships. Do not label them fake or
active businesses. Exact IDs and owner details are retained only in the ignored,
0600 `.gstack/qa-reports/production-workspace-inventory-20261024.json` audit.
No production records, grants or classifications changed. The exact four IDs
are configured on API/dashboard production environments for the reviewed rollout.

## Reporting boundary

ADR 0024 defines reporting-only exclusions through
`ADOPTION_EXCLUDED_WORKSPACE_IDS`. This corrects Oversight without making
founder/internal data purgeable. Summaries, daily series, searches, cursors,
directories and membership counts share the same population filter.
Malformed config returns unavailable operational data; optional Logly analytics
instead becomes a no-op so product operations remain usable.

Future server-side product events with excluded workspace IDs are suppressed.
IDs remain absent from outbound event payloads. Historic Logly traffic is not
rewritten or deleted; visits/anonymous events cannot be claimed as active teams.
The dashboard emits product events through its same-origin API, so this guard
needs its own reviewed source rollout there, not just the standalone API.
Current jobs emit no product analytics, so no worker analytics rollout is required.
Until both active producers are upgraded, suppression is not complete.

## Verification and release preparation

- Regression tests first failed on leaked internal activity and unchanged
  internal workspace totals, then passed after the filter.
- Helper and server analytics tests pass, including malformed configuration and
  preservation of live events; real local-DB tests cover all reporting surfaces
  and unchanged normal classification/purge fields.
- Full monorepo typecheck and scoped Biome pass. Latest full unit suite passes
  163 tests / 438 assertions; full integration passes 49 tests / 249 assertions.
  Test harness typecheck passes; concurrent tasks changed unrelated inventory.
- The initial isolated artifact was superseded when newer parallel releases
  reached production. Exact source archives for API `dpl_pAJ5H879cTNYM83w1M2LJk97NPCH`
  and dashboard `dpl_HRzeY1dXKNBFotreKpf6atURWom6` were retrieved using the
  authenticated Vercel CLI and archive SHA-1 verified. Only reporting modules
  and their required dependency/export/env plumbing were overlaid. Baseline
  and overlay hashes are in `outputs/adoption-reporting-api-release-20261024/current-release-provenance.json`.
  The latest compiled API smoke passes all four reads, exclusion, health and
  auth rejection. Latest isolated dashboard source passes eight focused tests
  / 19 assertions and all 15 typecheck tasks. New deployments remain off-domain
  until Ready and the live baseline is rechecked.
- Production API `dpl_GCGbj18JJUM9P6KXNwiE92A2P4rr` and dashboard
  `dpl_BBay1EG4CjkNZV8BoneCcMcSK1EG` built successfully and were promoted
  after a live-baseline recheck. Direct health returns 200; anonymous private
  reads return JSON 401. Oversight recovered from a transient data-loading
  response during rollout without source or access changes. Its live summary
  shows zero businesses/jobs/customers/follow-ups and three registrations.

## Pending input

- Founder confirmed Zeroes & One and Owner are both internal/test.
- Logly signed in. Settings have no persisted exclusion rule. Historic events
  lack workspace attribution; do not infer activation from anonymous visits.
- Trigger delivery acceptance is complete through the replacement below.
- Legal/support facts are confirmed; public pages are published and verified.

## Stage two: original credit blocker (superseded by replacement below)

Exact Afterservice project navigation confirms it belongs to the School Clerk
organization (the generic organization switch was blocked as apparently unrelated;
the exact configured project route established the correct boundary). Trigger
shows exhausted $5 monthly credits until 2026-11-01 or an upgrade. Hobby is
displayed at $10/month. Billing is open in the in-app browser for the founder.
No financial action or follow-up email was submitted. The active worker's mode
is correctly `production`. A separate future-deploy `prod` alias regression is
fixed and passes nine routing tests. The replacement below includes that fix
and supersedes this original credit/upgrade blocker.

## Delivery stage completed — 2026-10-24

The founder requested replacement under Zeroes & One. Worker and production
app dispatch migration are verified, and exactly one approved canary arrived
in Gmail. See `trigger-project-migration.md`. The canary uses an existing
excluded workspace and is closed. Legal/support work is complete. The founder
confirmed the operator is Zeroes and One Hi-Tech in Nigeria and
hello@afterservice.app is working and monitored.
See `legal-and-support-readiness.md` for public-page release verification.
