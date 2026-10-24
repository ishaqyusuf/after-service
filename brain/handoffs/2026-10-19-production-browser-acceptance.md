# Production Browser And Google Acceptance

Date: 2026-10-19
Status: Requested Google callback and manual production browser acceptance complete

## Outcome

Restarting Chrome and the desktop app restored browser control. In Google Cloud
project `after-service`, the existing AfterService Web client now has:

- JavaScript origin: `https://dash.afterservice.app`
- Redirect URI: `https://dash.afterservice.app/api/auth/callback/google`

The save confirmation and persisted values were inspected. Existing authorized
origins and callbacks were preserved. No credentials were rotated or scopes
expanded. Google sign-in reached the authenticated dashboard, and succeeded again
on the final deployment. The owner's real workspace was inspected without
business-data mutations. Operator tests used a generated verification identity.

## Production Browser Coverage

Chrome desktop and mobile device emulation exercised:

- Empty signup validation, successful email signup, onboarding, and seeded overview.
- Customer creation/edit, submitted search/no results, mobile edit and archive.
- Completed job creation with an existing customer, custom service title, and amount.
- Job-derived phone follow-up, date rescheduling, synthetic manual contact log,
  reply, closure, and corresponding board/history state changes.
- Starter templates, phone template creation/default persistence, edit/search/archive.
- Workspace name and cadence persistence after reload.
- Free Beta billing/usage and intentionally disabled paid checkout.
- Mobile drawer navigation, follow-up board/work panel, customer editing, sign-out,
  protected-route return path, invalid-password rejection, and valid password login.
- Public home, features, pricing, privacy, terms, and marketing login/signup redirects
  to the canonical dashboard origin.
- Google callback return before and after the final calendar-fix deployment.

Actual device emulation included a confirmed 412×924 billing viewport with document
width 412; later narrow-board reads reported width 309 with document width 309.
This verifies responsive browser behavior, not native Android installation. Browser
viewport override APIs that reported success without changing layout were not
counted as mobile evidence. Device emulation was disabled and DevTools closed at
completion. Production cross-browser testing beyond Chrome was not repeated here;
the prior local 40-case Chromium/Firefox/WebKit/mobile suite passed on 2026-10-18.

All operator data was recognizably synthetic. The generated customer and custom
template were archived; its follow-up was closed after regression checks. The
verification identity/workspace and audit history remain for inspection. No real
call was placed, no email sent, no payment attempted, and no jobs worker started.
Generated credentials are stored only in a private temporary file, never this report.
The final browser tab shows the authenticated owner's dashboard.

## Bug Found And Fixed

On Oct 19 in Africa/Lagos, choosing Oct 20 persisted local midnight as Oct 19
23:00 UTC. The old server-local end-of-day comparison put it under Due today.
It also allowed overdue sent items in both Due today and Waiting.

The API and dashboard now accept/use validated IANA timezone query input, with UTC
fallback for existing callers. Initial UTC hydration is stable, followed by a
separate browser-timezone cache key. Shared calendar-day helpers handle UTC date
changes and DST. Each follow-up belongs to one board stage; sent work remains
Waiting. Overview calendar counts use the same timezone and exclude sent work
from due/overdue/upcoming. Saved due instants and cron behavior are unchanged.

Live regression results after deployment:

1. Oct 20 local-midnight record: Upcoming 1, Due today 0.
2. Overview: Due today 0, Overdue 0, Next 7 days 1.
3. Rescheduled overdue Oct 18 record: Due today 1 before contact logging.
4. After synthetic phone log: Waiting 1, Due today 0, no duplicate card.
5. Final synthetic record closed; active stages empty.

## Deployments And Checks

- API: `dpl_GiAtX8L27jfrfwQAxPQ9rwwvrT9g`, Ready, aliased to `api.afterservice.app`.
- Dashboard: `dpl_EZAeCXZXNQnLqPXGSvf3aEdirV5X`, Ready, aliased to
  `dash.afterservice.app` and the existing legacy dashboard domain.
- Website unchanged in this continuation; public production pages were exercised.
- Production API smoke: all 13 public/auth/CORS/QA-absence checks passed.
- Unit tests: 65 pass, 148 assertions.
- PostgreSQL integration tests: 36 pass, 126 assertions.
- Monorepo typecheck and test-harness typecheck passed.
- Scoped Biome checks for API/calendar helpers/hook/integration tests passed.
- `git diff --check` passed.

Logly's scoped production read after browser test start found two
`continue_with_email_clicked` events at each of `dashboard_sign_in` and
`dashboard_sign_up`. This proves the deployed click handlers and collector
persistence, alongside the earlier synthetic collector test. Output contains
counts and locations only.

## Evidence

Local evidence directory: `outputs/production-browser-20261019/` (not deployed).

- `google-callback.jpg`: saved Google client settings.
- `google-sign-in-final.jpg`: final deployed Google authentication result.
- `calendar-tomorrow-upcoming.jpg`, `calendar-overview.jpg`,
  `calendar-waiting-exclusive.jpg`: date-boundary/exclusive-stage regression proof.
- `final-closed-board.jpg`: synthetic follow-up closure.
- `mobile-billing.jpg`, `mobile-follow-up-board.jpg`, `mobile-work-follow-up.jpg`,
  `mobile-password-session.jpg`: mobile production evidence.
- `website-home.jpg`: production public site.
- `checks.json`: completed browser check manifest without credentials.
- `logly-browser-counts.json`: scoped event-count evidence.

## Findings And Remaining Acceptance

Priority order:

1. Trigger credits: complete the already approved single-recipient queued email
   delivery check after credits are restored. Production credentials/worker are
   configured; no delivery claim is made. Do not start an unrestricted local worker.
2. Real beta activation: select/review prospects, send authorized invitations, and
   observe independent onboarding and actual follow-up use. Materials are ready.
3. Physical Android Chrome PWA install-dialog verification.
4. Deployed-preview QA accelerator acceptance, routed-email canary, and first
   explicitly reviewed purge. Internal QA endpoints remain absent in production.

Nonblocking polish observed: dashboard favicon 404 in the earlier session;
unnamed icon controls (create/mobile navigation); temporary Radix focus/aria-hidden
warnings on mobile. The final regression phase returned no captured warning/error
entries, but this does not erase earlier observations. No persistent application
crash blocked the tested flows. Repository-wide UI lint debt remains separate.
Paid checkout is intentionally deferred during Free Beta.

## Brain Documentation Impact Check

Updated in this continuation:

- `brain/handoffs/2026-10-19-production-browser-acceptance.md` (this report)
- `brain/decisions/0015-use-operator-timezone-for-follow-up-calendar.md`
- `brain/api/contracts.md`
- `brain/features/follow-up-board-mvp.md`
- `brain/features/dashboard-hostname.md`
- `brain/features/auth-email-analytics.md`
- `brain/engineering/testing.md`
- `brain/product/roadmap.md`
- `brain/product/beta/README.md`
- `brain/product/beta/onboarding-playbook.md`
- `brain/tasks/in-progress.md`
- `brain/tasks/done.md`

No database schema, relationship, or migration changed. API contract, feature,
auth/provider acceptance, task status, and beta guidance impacts are covered above.
Older dated browser-disabled/OAuth notes remain historical evidence.
