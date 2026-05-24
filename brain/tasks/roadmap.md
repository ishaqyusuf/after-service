# Execution Roadmap

## Purpose
This file tracks phase execution status for afterservice.

## Phase 1: Repo Bootstrap
Status: done.

Tasks:
- [x] Create repo directory.
- [x] Initialize Git on `main`.
- [x] Add Bun/Turbo root config.
- [x] Add website app.
- [x] Add dashboard app.
- [x] Add API app.
- [x] Add shared packages.
- [x] Add root env files and example.
- [x] Install dependencies.
- [x] Verify typecheck, lint, build, and local smoke checks.

## Phase 2: Environment System
Status: done.

Tasks:
- [x] Add workspace env runner.
- [x] Update app/package scripts to use env runner.
- [x] Split local and production env loading behavior.
- [x] Add env validation helpers.
- [x] Expand `.env.example`.
- [x] Document env usage in README and brain.
- [x] Verify dev/build with env runner.

## Phase 3: App Shells
Status: done.

Tasks:
- [x] Add website routes.
- [x] Add dashboard routes.
- [x] Add API tRPC mount.
- [x] Add auth placeholder routes.
- [x] Add Lemon Squeezy webhook placeholder.
- [x] Add shared app metadata.
- [x] Verify every route boots.

## Phase 4: Design System And Navigation
Status: done.

Tasks:
- [x] Build base UI components.
- [x] Build dashboard shell.
- [x] Build website nav/footer.
- [x] Build shared nav registry.
- [x] Add responsive layout rules.
- [x] Verify dashboard scanability.

## Phase 5: Database Foundation
Status: done.

Tasks:
- [x] Add Prisma.
- [x] Configure Postgres datasource.
- [x] Add auth/workspace models.
- [x] Add customer/job/follow-up/template/event/message models.
- [x] Add billing models.
- [x] Add initial migration.
- [x] Add generated client export.
- [x] Add seed helper for default templates.

## Phase 6: Authentication And Workspace Onboarding
Status: pending.

Tasks:
- [ ] Add auth package implementation.
- [ ] Add sign-up page.
- [ ] Add sign-in page.
- [ ] Add session resolver.
- [ ] Add API auth context.
- [ ] Add onboarding flow.
- [ ] Create workspace and owner membership.
- [ ] Seed default templates after onboarding.

## Phase 7: Customer Management MVP
Status: pending.

Tasks:
- [ ] Add customers router.
- [ ] Add customer list page.
- [ ] Add customer create/edit forms.
- [ ] Add customer detail view.
- [ ] Add search and filters.
- [ ] Add archive behavior.
- [ ] Verify workspace scoping.

## Phase 8: Service Job MVP
Status: pending.

Tasks:
- [ ] Add service jobs router.
- [ ] Add jobs table.
- [ ] Add job create/edit forms.
- [ ] Add job detail panel.
- [ ] Add mark completed action.
- [ ] Add create follow-up from job action.
- [ ] Verify customer history integration.

## Phase 9: Follow-Up Board MVP
Status: pending.

Tasks:
- [ ] Add follow-ups router.
- [ ] Add board view.
- [ ] Add table view.
- [ ] Add filters.
- [ ] Add status transitions.
- [ ] Add reschedule/assign actions.
- [ ] Add follow-up detail panel.

## Phase 10: Follow-Up Templates
Status: pending.

Tasks:
- [ ] Add templates router.
- [ ] Add template manager page.
- [ ] Add starter templates.
- [ ] Add merge tag resolver.
- [ ] Add template picker.
- [ ] Add draft preview.

## Phase 11: Lemon Squeezy Subscriptions
Status: pending.

Tasks:
- [ ] Add Lemon Squeezy env validation.
- [ ] Add billing router.
- [ ] Add checkout creation.
- [ ] Add webhook signature verification.
- [ ] Add idempotent billing event storage.
- [ ] Sync subscription state to workspace entitlements.
- [ ] Add billing page integration.

## Phase 12: Plan Gates And Entitlements
Status: pending.

Tasks:
- [ ] Define plan limits.
- [ ] Add entitlement helpers.
- [ ] Enforce limits in API.
- [ ] Add usage summary UI.
- [ ] Add upgrade prompts.
- [ ] Verify webhook-updated entitlement changes.

## Phase 13: Notifications And Messaging Foundation
Status: pending.

Tasks:
- [ ] Add message payload contracts.
- [ ] Add message log queries.
- [ ] Add manual sent logging.
- [ ] Add provider abstraction.
- [ ] Add follow-up timeline events.
- [ ] Add no-send local safety.

## Phase 14: Jobs And Automation Readiness
Status: pending.

Tasks:
- [ ] Add due follow-up finder.
- [ ] Add overdue/missed updater.
- [ ] Add dry-run job.
- [ ] Add automation hook interfaces.
- [ ] Add job logs.
- [ ] Verify no accidental outbound messaging.

## Phase 15: Marketing Website
Status: pending.

Tasks:
- [ ] Build polished home page.
- [ ] Build pricing page.
- [ ] Add signup/login CTAs.
- [ ] Add optional feature/customer pages.
- [ ] Add terms/privacy placeholders or pages.
- [ ] Verify product copy uses afterservice.

## Phase 16: QA, Verification, And Hardening
Status: pending.

Tasks:
- [ ] Add full verification checklist.
- [ ] Add browser smoke testing.
- [ ] Add API tests.
- [ ] Add billing webhook tests.
- [ ] Add auth/permission tests.
- [ ] Run naming scan.
- [ ] Run full build.

## Phase 17: Deployment Preparation
Status: pending.

Tasks:
- [ ] Add production env checklist.
- [ ] Document domain mappings.
- [ ] Document Lemon Squeezy webhook URL.
- [ ] Add deployment commands.
- [ ] Add observability notes.
- [ ] Verify production build.
