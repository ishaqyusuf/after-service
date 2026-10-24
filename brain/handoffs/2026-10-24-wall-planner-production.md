# Wall planner production release — 2026-10-24

Status: deployed; live desktop and mobile viewport acceptance passed.

## Source and release

- Redesign commit: `ea0aa45`; final application release commit: `7f51ea0`.
- PR: https://github.com/ishaqyusuf/after-service/pull/3.
- Marketing: https://afterservice.app, deployment `dpl_2DN2A69jwakDPeLwbxCRCim9vRfs`.
- Dashboard: https://dash.afterservice.app, deployment `dpl_7FYvHFfUHRGCzKjJJtSpJjKGNw7i`.
- Rollback: marketing `dpl_DUhi4yXDmJjw1xWsy1C1zRUcmbjU`; dashboard `dpl_GHmcvoNejmKAymuzGDpGqcaCtECa`.

Both optimized Vercel production builds reached Ready. Each canonical alias
was checked against the frozen baseline immediately before promotion and
re-read afterward. Existing production source was verified against Vercel
SHA-1 manifests (669 website files; 572 dashboard files). Two differing retained
dashboard source files were retrieved and hash-verified before use.

The isolated branch preserves already-live pricing/billing source in `80a2079`,
retains previously committed brand/legal/adoption work, and applies the task's
saved-baseline delta. No environment variables or schema were changed. Turbo's
already-live pricing passthrough is preserved. The separate pending password-
recovery runtime repair is explicitly excluded: its eight auth paths match the
live baseline; its local work remains intact. The shared checkout was not reset,
stashed, switched, staged or committed. Hash comparison before final Brain
updates found zero modifications to its existing files.

## Verification

- Final isolated source: full 15-package typecheck, test typecheck, 177 unit tests
  / 458 assertions, scoped redesign Biome and whitespace checks pass. Three
  pending recovery proxy tests are excluded with that separate runtime rollout.
- Independent UI and release-provenance reviews found no verified blockers.
- Earlier implementation: both local optimized builds and all 20 Chromium/Pixel
  cases covered across the full run and targeted selector fixes/reruns.
- Live dashboard: 1280px desktop, 390px and 320px phone viewports. All eight
  sections render; document width stays within the viewport. Phone tables keep
  internal horizontal scrolling. Global search filters and opens Customers;
  sidebar collapse persists across reload and was restored; mobile navigation
  closes on route change; the Closed stage opens the actual follow-up sheet.
- Live sheets: customer create sheet opens and closes; follow-up work tabs and
  history load; its bounds settle to 0–390px and 0–320px. Archive opens a short
  confirmation modal; Cancel leaves the existing customer unchanged. No form
  submission, message, payment or customer data mutation was performed.
- Live marketing: 1440px desktop and 390/320px phone viewports. Hero/record tabs,
  mobile navigation, home, pricing, feature/index/detail, guide, solution and
  current legal pages pass; no document overflow. Ordinary Nigeria pricing
  shows NGN 5,000/month, and Choose Business reaches authenticated billing
  with that exact price. No hosted checkout or payment was submitted.
- Browser console error checks returned zero errors. Public response and PWA
  manifest/service-worker/icon checks pass. Production QA capability is absent.

These are browser viewport checks, not physical-device/PWA-install acceptance.
The live pass preserves the current dark preference; local implementation also
passed light/dark visual checks. No Firefox/WebKit or volume benchmark is claimed.

## Evidence

`outputs/wall-planner-production-20261024/` contains promotion, HTTP, browser and
source receipts. Screenshots: `wall-planner-live-dashboard-desktop.png`,
`wall-planner-live-dashboard-mobile.png`, `wall-planner-live-follow-up-mobile.png`,
`wall-planner-live-marketing-desktop.png`, `wall-planner-live-marketing-mobile.png`
in the current chat visualization directory. Workshop release receipts are
recorded against the exact accepted revisions in the feature record.

Brain impact: this handoff, complete-ui-redesign-workshop, the Wall planner
migration contract and ADR 0026, marketing-website-care-continues and tasks/done.
No API contract or database-schema change is required for the redesign.
