# Preview QA Acceptance — 2026-10-19

## Result

The isolated dashboard preview passed browser and HTTP acceptance at
`https://after-service-qa-preview.vercel.app`. Final ready deployment:
`dpl_BAWhxGWEWU7ui5xwQhGC9GTrxJQV`. It uses the dedicated restricted database
login on the retained schema-only Neon branch. Production deployments and
database configuration were not changed during this preview pass.

The user approved the isolated Preview credential setup, a restricted login,
and retaining the branch. Vercel-to-Neon SSO was used; no new Neon GitHub email
permission was accepted. ADR 0016 records the isolation and maintenance contract.

## Defects Fixed

- Turbo strict environment filtering omitted QA mode/secret/origin flags, so
  the first preview compiled production QA stubs. The build allowlist and a
  regression now preserve the server-controlled preview configuration.
- QA cookies used a different auth base URL rule from ordinary local sessions.
  Both now use a shared resolver; production URL behavior is preserved.
- Job Quick Fill supplied strings to Date-valued form controls. It now supplies
  Date objects, with regression tests and deployed date-picker proof.
- Follow-up mutation errors could leave the form unchanged without explaining
  the rejection. All four work-form mutations set a visible field error. The
  browser confirmed the expected QA phone-effect rejection is visible.

These fixes are in source and Preview. Promote the relevant dashboard/auth
changes to Production and smoke-test ordinary auth/work forms before counting
the newest fixes as production-delivered.

## Evidence

- 71 unit tests / 163 assertions and 45 real local PostgreSQL integration tests /
  157 assertions passed. Full monorepo and test-harness typechecks passed;
  scoped Biome and whitespace checks passed. The final Vercel preview build is
  Ready. Earlier four-configuration manual-MVP browser coverage remains 40/40;
  it was not rerun as a new full cross-browser preview matrix.
- All 17 deployed HTTP checks passed using the restricted runtime login:
  capability/version gating, anonymous denial, missing/forged origins, malformed
  exchange, credential exchange, exact workspace profile, single-use selection,
  ordinary session/context, stripped platform-admin access, fixture context,
  authorization revocation, and denial after revocation.
- Browser acceptance covered invalid credential clearing, exact-domain picker
  filtering across five synthetic workspace classes, search recovery, ordinary
  dashboard entry, customer regenerate/reset/determinism and explicit creation,
  job date pickers, matching follow-up draft prerequisites, template default-off,
  workspace reset, signup identity with blank password, work-panel recipes,
  visible provider-effect denial, and revoked-session redirect.
- Database audit: 2 customers (1 explicitly created), 1 job, 1 follow-up,
  3 templates, 0 message logs, 0 follow-up events. The generated customer email
  matches the authorized QA domain. Draft actions produced no implicit writes.
- The tester grant is REVOKED, with zero active authorizations or derived
  sessions. The browser returned to sign-in after reload. Retained synthetic
  fixtures support future QA with a newly issued short-lived grant.
- All 14 production QA route GET/POST probes returned 404, including forged
  enable headers. No worker, email, checkout, purge, or real outreach ran.
- Read-only purge preview classified four QA workspaces / 15 records and
  correctly reports LIVE_PAID_SUBSCRIPTION for the synthetic paid fixture.
  No purge was started. Trigger credits are also required for `qa-purge`.

Sanitized evidence is in `outputs/preview-qa-20261019/`, including
`http-checks.json`, `browser-checks.json`, `db-final.json`,
`runtime-privileges.json`, `grant-revocation.json`, `production-absence.json`,
`purge-preview.json`, and screenshots. Credentials/cookies are excluded.

## Remaining MVP Work In Priority Order

1. Promote the newly verified form/auth/build fixes to Production and run the
   narrow production auth/work-form smoke. This pass deployed Preview only.
2. Restore Trigger credits, then verify the approved single configured-recipient
   email, routed QA delivery canary, and separately reviewed first purge. Never
   dispatch the broad purge preview while its paid-fixture blocker is present.
3. Select and invite real beta operators using the prepared onboarding kit;
   observe activation and collect feedback. No real recruitment outcome exists.
4. Verify the native PWA installation dialog on physical Android Chrome.

Paid checkout, SMS/WhatsApp automation, customer self-onboarding, migration
baselining, and broad shared UI lint cleanup remain later work. The Jobs toolbar
plus action also lacks an accessible name in current UI; label cleanup is
tracked separately from the passed preview functional flow.

## Brain Impact Manifest

- `brain/decisions/0016-isolate-and-retain-preview-qa-database.md`
- `brain/features/web-dev-preview-qa-accelerator.md`
- `brain/plans/2026-08-30-feature-web-dev-preview-qa-accelerator.md`
- `brain/features/auth-session-loop-fix.md`
- `brain/features/service-jobs-mvp.md`
- `brain/features/follow-up-board-mvp.md`
- `brain/database/migrations.md`
- `brain/engineering/testing.md`
- `brain/product/roadmap.md`
- `brain/tasks/in-progress.md`
- `brain/tasks/done.md`
- This acceptance report.

No business schema, API route, or API permission contract changed in this pass;
database schema/relationship and API endpoint/contract documents need no delta.
