# In Progress

## Purpose
This file tracks active work.

## Current

### Traffic Review And Oversight Portfolio Integration
- Started Date: 2026-10-24
- Status: Source Verified; Production Activation In Progress
- Current Notes: Live Logly traffic and authenticated Oversight checks completed
  in the in-app browser. Afterservice is registered but unconnected. Implemented
  independent-key, dedicated-read-DB portfolio endpoints and matching Oversight
  contracts/service labels. 102 unit tests and 46 database integration tests
  pass; API/DB and Oversight typechecks pass. Root typecheck has an unrelated
  existing pricing-test type error.
- Next Step: Activate the scoped production read connection and verify the
  snapshot/directories in-app. Password recovery and public legal placeholders
  are confirmed next fixes, not completed by this implementation.
- Details: `brain/features/oversight-integration.md` and
  `brain/handoffs/2026-10-24-traffic-mvp-review.md`.

### Production Fix Deployment And Dashboard Hostname Rollout
- Started Date: 2026-10-18
- Status: Production Browser And Google Acceptance Complete; Email Credits Pending
- Scope: Deploy the verified MVP fixes to API/dashboard/website, attach
  `dash.afterservice.app`, align production URLs, and verify the deployed flow.
- Current Notes: API/dashboard/website fixes and canonical hostname are deployed.
  Browser access works after the Chrome/app restart. Google callback registration
  and real Google authentication succeeded. Desktop/mobile production browser
  checks passed for the manual operator journey, password sessions, and public
  auth redirects. Logly recorded actual email-submit interactions at both auth
  locations. Calendar day grouping was corrected for the operator timezone and
  sent follow-ups no longer appear in two board columns.
- Continuation: Daily Vercel cron remains configured and verified. Beta materials
  now permit Google sign-in. Real recruitment remains pending. Trigger production
  credentials are configured, but delivery acceptance remains blocked by credits;
  no test email was sent and no worker started during browser acceptance.
- Next Step: Complete the approved single-email check after credits are available;
  recruit real beta operators. Physical Android PWA remains a separate check; isolated preview QA
  acceptance passed on 2026-10-19. See
  `brain/handoffs/2026-10-19-production-browser-acceptance.md`.
- Safety: Bulk credential export was rejected and not performed. The user
  approved only targeted Trigger configuration and one test-recipient email.

### Replace OpenPanel With Logly
- Priority: High
- Description: Install the thin Logly SDK packages and use the standalone,
  project-isolated collector instead of OpenPanel.
- Related Decision: `brain/decisions/0009-use-logly-shared-first-party-analytics.md`
- Related Plan: `brain/plans/2026-08-30-feature-first-party-analytics.md`
- Status: Implemented And Production Verified
- Started Date: 2026-08-31
- Current Notes: The Afterservice wrapper, same-origin website route, trusted
  server adapter, report reader, env contract, and active Brain docs now target
  the `@ishaqyusuf/logly-*` packages. The Logly production project exists with
  both Afterservice origins, and least-privilege scoped keys are configured in
  both Vercel Production projects. Logly discovers structurally valid event
  names automatically; Afterservice keeps typed helpers only for call-site DX.
  All three `0.2.0` packages are published under `@ishaqyusuf`, and `bun.lock`
  resolves the normal npm artifacts with no tarball or sibling-filesystem
  dependency. Thirty focused auth/database/QA/analytics tests, the full
  monorepo typecheck, both local smoke suites, and both production Next.js
  builds pass. Local Afterservice and
  Logly now run together through their shared local-infra profiles against
  separate Docker PostgreSQL containers. The repeatable
  `bun run smoke:logly:local` check sends a unique uncatalogued event through
  Afterservice and verifies it in Logly. `bun run smoke:mvp` also passes the
  complete local auth/operator/queued-notification/permission/job/webhook flow.
  Trigger.dev local workers now use the resolved local-infra database rather
  than remote project env precedence. Dashboard deployment
  `dpl_782fShBGSkGRw9rbYeDrw5LMYf6j` and marketing deployment
  `dpl_2hTXPZZhAUAeiHhg8PjhyZiWtWLP` are live. Chrome confirmed production
  Google auth availability, production debug diagnostics disabled by both the
  Vercel environment and a fail-closed production code guard, and real
  `site_visit` plus uncatalogued smoke events in Personal / Afterservice. The
  retired OpenPanel packages, runtime references, and Vercel variables are gone.
  Production and Preview now have distinct randomly generated Better Auth
  secrets after an approved session-invalidating rotation. The replacement
  build emits no secret-length or entropy warnings, the anonymous session
  endpoint responds normally, and existing-password sign-in validation now
  delegates every non-empty password to the server rather than applying the
  new-password length policy.
- Next Step: review event usefulness/volume after the pilot window and onboard
  a second product.
- Post-MVP hardening backlog.

## Notes
- MVP operator flows for customers, jobs, follow-ups, templates, billing, entitlements, notifications, cron-protected dry-run jobs, and public website legal/feature pages are implemented.
- Core browser and deeper API coverage passed on 2026-10-18; see
  `brain/engineering/testing.md` and the completed task record. The remaining
  MVP rollout/verification checklist is in `brain/product/roadmap.md`.

### Fix Mobile Chrome Install Not Working
- Priority: High
- Description: Track plan in `brain/plans/2026-06-12-bug-fix-mobile-chrome-install-not-working.md`.
- Related Feature: Fix Mobile Chrome Install Not Working
- Status: Implemented - Pending Device Verification
- Plan Status: Implemented - Pending Device Verification
- Plan File: brain/plans/2026-06-12-bug-fix-mobile-chrome-install-not-working.md
- Created Date: 2026-06-12
- Current Notes: Code-side PWA install hardening is implemented for the website service worker, manifest, mobile install sheet, analytics events, and repeatable `pwa:verify` checks. Local production response checks and direct system Chrome mobile DOM/CDP smoke passed on 2026-06-15, including zero Chrome manifest/installability errors and a registered/controlling service worker. A `Pixel_3a_API_34` emulator booted and Android Chrome was launched, but System UI ANR/black-screen instability prevented trustworthy native install-dialog verification.
- Next Step: Re-test on physical Android Chrome or Chrome DevTools with installability diagnostics and confirm the install dialog opens when criteria are met.

### Web Development And Preview QA Accelerator
- Priority: High
- Description: Port the shared Halaalvest/EwaTrade QA standard and local-infrastructure workflow to afterservice.
- Related Feature: Web development and preview QA accelerator
- Status: Isolated Preview Acceptance Passed - Provider Checks Pending
- Plan Status: Implemented - Provider Canary And Reviewed Purge Pending
- Plan File: `brain/plans/2026-08-30-feature-web-dev-preview-qa-accelerator.md`
- Created Date: 2026-08-30
- Current Notes: Retained schema-only Neon Preview branch and restricted runtime
  login configured as approved. Deployed Chrome acceptance, 17 HTTP checks,
  draft write audit and test-grant revocation passed. Latest source regressions
  cover QA cookie resolution, strict build configuration, Quick Fill dates and
  visible form errors. See `brain/handoffs/2026-10-19-preview-qa-acceptance.md`.
- Next Step: Promote the newest verified source fixes to Production with a narrow
  auth/work-form smoke. After Trigger credits are restored, complete the routed
  email canary and separately reviewed purge; never bypass paid-fixture blockers.

## Template
```md
## <Task Name>
Started:
Phase:
Owner:
Goal:
Current Notes:
Next Step:
```
# Cross-product QA email and cleanup

- Schema alignment and secure route propagation are verified. Isolated preview
  acceptance passed. Canary delivery and the first reviewed purge require
  Trigger credits; the read-only purge preview still blocks the synthetic paid
  workspace. No purge was started.

## Operations Assistant Handoff

Core implementation and isolated verification are complete in
`codex/operations-assistant`. See the done entry and
[verification record](../engineering/assistant-verification.md). Production activation and live verification are complete; see the dated
[rollout record](../handoffs/2026-10-24-assistant-production-rollout.md).
