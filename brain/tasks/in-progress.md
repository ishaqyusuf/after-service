# In Progress

## Purpose
This file tracks active work.

## Current

### Marketing website: The care continues
- Priority: High
- Description: Implement selected v2 direction 01 across the production marketing website and connected routes.
- Related Feature: `brain/features/marketing-website-care-continues.md`
- Status: Implemented locally; production release in progress
- Started Date: 2026-09-29
- Current Notes: Shared marketing shell, customer journey, responsive narrative, pricing, SEO route families, local fonts, and Brain decision are implemented. Local typecheck, website source lint, production-profile webpack build, PWA response check, and browser route and interaction QA passed.
- Next Step: Commit, deploy the linked after-service-marketing Vercel project, verify the live production URL, and move this entry to done.

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
- Remaining hardening is full Playwright coverage beyond the focused browser smoke, deeper edge-case integration tests, and production provider configuration.

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
- Status: Source Implemented - Pending Rollout Verification
- Plan Status: Implemented - Rollout And Deployed-Preview Acceptance Pending
- Plan File: `brain/plans/2026-08-30-feature-web-dev-preview-qa-accelerator.md`
- Created Date: 2026-08-30
- Current Notes: Source implementation includes local infrastructure, credential exchange, exact-domain account selection, ordinary scoped sessions, deterministic Quick Fill with reset/regenerate, provider/destructive guards, production exclusions, migration, and focused contract tests.
- Next Step: Install workspace dependencies in the rollout environment, generate/apply Prisma, run the focused typecheck/build, then execute local and deployed-preview browser acceptance plus the routed-email canary and first reviewed purge.

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

- Product implementation is integrated. Schema rollout, secure route
  propagation, canary delivery, and first reviewed purge remain deployment
  work.
