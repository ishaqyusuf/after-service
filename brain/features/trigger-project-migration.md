# Trigger project migration

Updated: 2026-10-24
Status: production replacement and single delivered-email acceptance complete

The founder requested a replacement under Zeroes & One instead of upgrading
the exhausted School Clerk organization. ADR 0025 records the project binding.

| Setting | Existing | Replacement |
| --- | --- | --- |
| Organization | School Clerk | Zeroes & One |
| Slug | school-clerk-7783 | zeroes-one-9521 |
| Project | AfterService | afterservice |
| Project ref | proj_hquxdnfjtrqbkznhiapz | proj_kirjkbvoswjxydkbdemr |
| Project slug | afterservice-USH4 | afterservice-D34a |

In-app browser verified creation and the destination's single founder owner.
The old project's settings contain rename/delete controls and no transfer.
No project, run history or production data has been deleted. No purchase made.

The worker typecheck and nine email routing tests pass. A dry-run built the
worker successfully. The initial real image build was stopped by Docker-cache
filesystem permissions; the retry used allowed cache access.
The retry succeeded and version `20261024.2` (`em19rhnm`) is promoted,
with six tasks. No-recipient run `run_06gms7e0r99fhll6vv7ckktba2` completed
with zero activities/dispatches. DB/Resend are non-revealable secrets, verified
through metadata without printing values. Older CLI sync excludes credentials
to preserve that property. Five initial worker variables are configured.

Activation copied only the production database and email configuration
required for notification delivery. Optional analytics-report, QA-purge and
payment credentials are not part of this initial activation. They remain
unconfigured/fail closed where required. Vercel owns production missed-follow-up
housekeeping; no duplicate Trigger cron is declared for it.

The no-recipient probe completed before changing the API/dashboard keys.
Production `TRIGGER_SECRET_KEY` (Sensitive) and non-secret project refs are
updated on both Vercel projects. Exact-source rebuilds are Ready and canonical aliases verified: API
`dpl_5ZCSYrB4rDgSn7eKXx1Upogar76B`, dashboard
`dpl_GHmcvoNejmKAymuzGDpGqcaCtECa`. Baselines are the pricing production
release, `dpl_GDX3HPo8qeWRi9LYtr9ZRZQ6tF6j` and
`dpl_A6ZYNrduUJwoxWW8fpF5BxrPxmuo`, respectively.
Their current live source must be preserved, including pricing, assistant,
onboarding and adoption exclusions. Actual inbox delivery acceptance passed below. Legal/support work is next.

Evidence: `.gstack/qa-reports/screenshots/2026-10-24/trigger-zeroes-afterservice-created.png`.

Old production schedules API returned no schedules; no schedule was disabled
or deleted. Old project and run history remain intact.

## Delivered email acceptance

The in-app dashboard used the already excluded Zeroes & One workspace. Created
one labelled internal customer/follow-up, submitted Log manual send once, and
observed the Sent/Waiting state. Replacement run
`run_06gms8s45cain550cf14sn2ka2` completed with one activity, one email sent and
zero failed. Gmail search in the approved founder account returned exactly one
matching conversation, in Inbox, from `noreply@afterservice.app`, with the exact
canary body. Received 2026-10-24 at 14:39 Africa/Lagos. The internal follow-up
was closed after verification; its customer and delivery audit are retained.
No new workspace was created, so the canary remains excluded from adoption.

Evidence: `trigger-zeroes-probe-completed.png` and
`trigger-migration-email-delivered.png` in the screenshot directory above.
The old project/history remains, and its production schedules API returned no
schedules. With explicit founder approval, only the Trigger project ID and
secret key were aligned in root `.env` (development) and `.env.production`
(production). Other assignments, comments and CLI profile were preserved.
Resolved project and environment key prefixes were verified without printing
credentials. Restart existing local processes normally to load changed values.
