# Traffic, Oversight and MVP review — 24 October 2026

## Progress

- [x] Inspect Logly and the live Oversight Afterservice entry.
- [x] Test public desktop/mobile navigation, pricing and signup validation in
  the Codex in-app browser; reproduce password recovery failure twice.
- [x] Implement and locally verify the private Oversight read contract on both
  products, preserving all prior working-tree changes.
- [x] Activate and verify the production connection, all directories and desktop/mobile UI.
- [ ] Separate follow-up: authenticated Afterservice operator CRUD regression
  after the pending dashboard Preview-fix promotion.

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
The single signup completion was inspected in-app: Logly displays 19 October
2026 at 14:03:43, email method, dashboard signup. It overlaps the documented
production acceptance window; attribution to a real new beta operator is unproven.

## Confirmed gaps

1. Password recovery: `/forgot-password` redirects to sign-in with that path
   as `return_to`, requiring the password before recovery can begin.
2. Privacy and terms pages visibly call themselves placeholders. Capture
   the actual product/provider/retention/support facts before replacing them.
3. Oversight was registered but unconnected. This gap is now resolved in
   production with an independent read key and scoped read-only DB login.
4. Production has four normal workspaces and zero classified QA workspaces.
   Confirm ownership/use and adopt genuine QA fixtures through the existing
   reviewed flow; do not silently reclassify or count them as beta activation.

Evidence and browser limits: `.gstack/qa-reports/qa-report-afterservice-app-2026-10-24.md`.

## Original priority order (see completed status and current order below)

1. Reconcile internal/test data now that the Oversight connection is live.
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

- Afterservice: initial 102 unit tests passed. Latest complete local integration
  suite passes 47 tests / 215 assertions, including successful authenticated
  HTTP reads and rejection of writes by the dedicated read client. Latest full
  monorepo and test-harness typechecks pass. Scoped Biome/whitespace checks pass.
- Oversight: all 8 tests / 62 assertions, full typecheck, optimized production
  build and actual desktop/mobile in-app acceptance passed.
- Production: all six authenticated operational reads return 200/no-store;
  unauthorized reads return 401. Normal API auth/CORS/cron/QA-absence smoke passes.
- Earlier broad checks temporarily failed while other pricing/Polar edits
  arrived in the shared checkout. Those source checks now pass; no unrelated
  pricing/billing code was changed by this task. The API rollout intentionally
  uses an isolated verified product bundle plus the latest read router, rather
  than publishing that separate billing refactor.

## Rollout receipt

- API: `dpl_6iJFD7r51ubTaMfMeZ7sdGykJee5`.
- Oversight: `dpl_247R3scm1EYKqPJWESR9sZxcg3rm`.
- Existing normal Vercel environment settings and daily API cron are preserved.
- Scoped production reader: `afterservice_oversight_reader_20261024`. Independent
  keys and database URL are server-only; no product mutation or outreach occurred.
- Isolated API artifact: `outputs/oversight-api-release-20261024/manifest.json`.
  A future coherent source deployment can return to the normal build path.

## Brain documentation impact

Updated the Oversight feature, ADR 0019, this review handoff, API endpoints,
contracts and permissions, observability, database reader/migration record,
engineering testing, task backlog, in-progress and completed task lists.
No business schema or relationship changes were needed. The persistent reader
grant is recorded separately from schema migrations. Product/customer data and
outreach state were not changed by the production rollout.

## Current priority order — 24 October 2026

Adoption reconciliation, Trigger replacement/delivered email and public legal/
support readiness are complete. See `2026-10-24-ordered-priorities-completion.md`.

1. Finish password-recovery success-navigation and new-password sign-in
   acceptance, then verify/release the committed repair in production.
2. Run the ordinary authenticated customer/job/follow-up regression on the
   current production release; keep canaries within excluded internal workspaces.
3. Onboard the first real operators through the existing beta kit and observe
   first customer/job/follow-up completion and return usage. Outreach still
   needs the user's explicit instruction.
4. Verify installation on a physical Android device.
5. Choose the next MVP feature from observed friction: CSV import if initial
   data entry blocks onboarding, recurring reminders if repeat work dominates.

Polar account/payout review is a parallel founder action, separate from the
engineering queue. Confirmed operator facts do not complete provider identity/
financial review or authorize a payment test.
