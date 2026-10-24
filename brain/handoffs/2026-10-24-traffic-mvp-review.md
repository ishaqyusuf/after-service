# Traffic, Oversight and MVP review — 24 October 2026

## Progress

- [x] Inspect Logly and the live Oversight Afterservice entry.
- [x] Test public desktop/mobile navigation, pricing and signup validation in
  the Codex in-app browser; reproduce password recovery failure twice.
- [x] Implement and locally verify the private Oversight read contract on both
  products, preserving all prior working-tree changes.
- [ ] Activate and verify the production connection.
- [ ] Authenticated operator regression after the latest production promotion.

## Traffic evidence

Initial seven-day Logly overview: 68 unique visitors and 105 events, compared
with about 14 visitors and 15 events in the preceding period. New/returning
classifications overlap and do not sum to unique people. Later this review's
own browser visit raised events to 106; collection health confirms persistence.
The 30-day stream showed 158 events, 120 site visits, seven email-button
activations, three customer creations, two jobs, and one signup completion,
workspace creation and follow-up creation. QA and production verification
events are included; neither real beta adoption nor message delivery follows
from those counts. The collector has no full pageview/session attribution.

## Confirmed gaps

1. Password recovery: `/forgot-password` redirects to sign-in with that path
   as `return_to`, requiring the password before recovery can begin.
2. Privacy and terms pages visibly call themselves placeholders. Capture
   the actual product/provider/retention/support facts before replacing them.
3. Oversight was registered but unconnected. Implementation now exists;
   production activation is separate from passing source tests.
4. Production has four normal workspaces and zero classified QA workspaces.
   Confirm ownership/use and adopt genuine QA fixtures through the existing
   reviewed flow; do not silently reclassify or count them as beta activation.

Evidence and browser limits: `.gstack/qa-reports/qa-report-afterservice-app-2026-10-24.md`.

## Priority order

1. Make the Oversight connection live and reconcile internal/test data.
2. Repair and verify password recovery end-to-end, including a real routed
   recovery email after provider readiness is confirmed.
3. Promote the already Preview-verified auth/build/form fixes and run ordinary
   production auth/follow-up smoke checks.
4. Restore Trigger credits and finish the existing approved email canary;
   queued acceptance alone is not delivered email.
5. Replace public legal placeholders with reviewed product-specific content;
   confirm the beta feedback/reply channel.
6. Recruit five to seven operators using the existing beta kit, observe first
   customer/job/follow-up completion, and measure repeat usage.
7. Verify physical Android installation; viewport QA does not prove PWA install.

## Next feature decisions

Core manual customers, jobs, follow-ups, templates and billing already exist.
Choose additions from observed operator friction: CSV customer import if data
entry blocks onboarding; recurring maintenance/follow-up sequences if teams
need repeat reminders; lightweight activation/weekly usage reporting to measure
habit. The existing phone/email-only customer self-onboarding flow is post-MVP
backlog. Automated SMS/WhatsApp, integrations and broad paid checkout remain
later gates. This review does not authorize outreach to beta prospects.

## Validation

- Afterservice: 102 unit tests, 46 PostgreSQL integration tests; API and DB
  typechecks; standalone API bundle passed.
- Oversight: connector/activation tests and full monorepo typecheck passed.
- Root Afterservice typecheck is blocked by a pre-existing type error in
  `packages/plans/src/index.test.ts:25` (`string` versus `PricingCurrency`).
  No unrelated pricing/test changes were made.
