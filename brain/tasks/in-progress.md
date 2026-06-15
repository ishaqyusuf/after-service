# In Progress

## Purpose
This file tracks active work.

## Current
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
