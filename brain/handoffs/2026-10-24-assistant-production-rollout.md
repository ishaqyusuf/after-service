# Operations Assistant Production Rollout — 2026-10-24

Status: deployed, live verified and synthetic cleanup complete.

## Merge And Production Targets

- [PR #2](https://github.com/ishaqyusuf/after-service/pull/2) merged into GitHub
  `main` at `dec07f24c0b2b2df8653d6bb525fe2a2e380af2a`.
- Follow-up `8c5e18b` adds the explicit Turbo assistant environment contract.
- Follow-up `401ef43` preserves the six onboarding files concurrently deployed
  while this rollout was building. The shared primary checkout, its index and
  uncommitted work were not replaced or reset; the merge is on GitHub main.
- Dashboard: `dpl_HRzeY1dXKNBFotreKpf6atURWom6`, Ready and promoted to
  [dash.afterservice.app](https://dash.afterservice.app/assistant).
- API: `dpl_pAJ5H879cTNYM83w1M2LJk97NPCH`, Ready and promoted to
  [api.afterservice.app](https://api.afterservice.app/health).

## Release Isolation

Reconstructed and hashed the exact deployed dashboard source from
`dpl_ArgCRKAwFDhVpejQ9MBHkXwBskQF`, overlaid the assistant runtime diff, and
preserved its existing auth, billing and country-tracking behavior. The promotion
guard caught a concurrent onboarding deployment
`dpl_8BAAXqngHFATBt9qSLFtDWALGU7N`; its six files were incorporated before the
final build, including the assistant's curated onboarding help. Rechecked the
current custom-domain aliases immediately before promotion. The API packaging
retains the previous production Oversight bundle byte for byte and replaces
only its product bundle. Twenty-four core assistant source files match merged
main. Unrelated original-checkout work was not uploaded. Website production
was not redeployed.

Only a small commit-specific ignored-build rule prevented GitHub's older source
baseline from replacing the individually preserved production releases. The
previous build rules are restored after the rollout record commit. A temporary
bypass created by `vercel curl` was revoked through the supported protection API;
previous deployment protection remains intact.

## Database Migration

Applied `20261024010000_operations_assistant` to the configured existing
production Neon database. Preflight found that the original SQL artifact omitted
the prompt/capability version fields; regenerated through the explicit Prisma
config. The exact SQL was applied to a fresh isolated local baseline database
and produced an empty diff. Production's read-only diff then matched those
5,419 bytes exactly before application.

The migration creates six tables and adds `ServiceJob.currency` with USD default.
No data is dropped. One transaction used bounded lock and statement timeouts;
existing user/customer/job/follow-up counts were unchanged. Post-apply Prisma
diff is empty, including both version columns. No historical migrations were
replayed because the existing production database has no Prisma history table.

SQL SHA-256: `0b7ba4f612613a5b2494b65f5c8402873212e68a944f2782d36603aa5449da8a`.

## Production Provider Configuration

Dashboard and API production each use the owner-authorized dedicated DeepSeek
credential as a Vercel sensitive variable. Provider `deepseek`, model
`deepseek-flash`, feature enabled, workspace/month allowance 1,000,000 tokens.
Workspace and capability limits remain server-controlled. Key values were not
printed, embedded in clients or committed. Other credentials, paid-checkout and
email settings were not changed. The initial build's missing Turbo declarations
were fixed before promotion; the final build has no assistant-variable warnings.

## Verification

- Merged-source unit suite: 114 passing / 324 assertions.
- Production-derived app/package regressions: 66 passing / 198 assertions.
- Preserved onboarding recovery: nine passing / 30 assertions.
- Production-derived assistant contracts/database: 19 passing / 95 assertions.
- Full production-derived typecheck, dashboard typecheck and local/remote
  dashboard builds passed; standalone bundled API build passed.
- Earlier eight desktop/mobile cases and seven synthetic real-model scenarios
  remain documented in the feature verification record.
- Production API smoke: 13 read-only/unauthorized probes passed.
- Production canary: ten checks passed, including public sign-in, authenticated
  assistant redirect, API/dashboard auth rejection, exact-origin enforcement,
  internal QA absence, retained private Oversight boundary and unchanged website.
  Sign-in HTTP response was measured at 980 ms in this sample.
- A new synthetic account/workspace was created through ordinary production auth
  and onboarding. No existing operator account was impersonated.
- Dashboard real DeepSeek workload reads, editable customer creation, draft edit,
  explicit confirmation, repeated confirmation, saved receipt/reload, editable
  unsent message after clarification, dated report and billing/help passed.
- The model correctly requested clarification when no recorded service job
  existed; a general check-in was then drafted without inventing service facts.
- The standalone API accepted the normal signed session and completed a real
  DeepSeek workload reply through its own live route.
- A separate private Chrome session signed in as the generated account and
  exercised the actual production chat composer with a real DeepSeek reply.
  Navigating to ordinary Customers showed the single reviewed customer.
- Database audit: eight completed DeepSeek runs, exactly one action receipt,
  zero outbound message logs, zero outstanding token reservations; the configured
  production database and live runtime were proven to match by the fixture IDs.
- Measured total usage: 102,149 tokens across those eight live runs.
  This is acceptance usage, not a general latency/quality guarantee.
- The isolated browser session was closed, preserving existing user sessions.
  The exact generated workspace/user and their sessions, drafts, usage and
  business fixture records are removed by the guarded cleanup; no real workspace
  is touched.

## Evidence And Brain Impact

- [Feature and configuration verification](../engineering/assistant-verification.md)
- [Feature behavior](../features/operations-assistant.md)
- [Migration record](../database/migrations.md)
- [Task completion](../tasks/done.md)
- [In-progress rollout pointer](../tasks/in-progress.md)
- [Roadmap](../tasks/roadmap.md)
- [Project index](../PROJECT_INDEX.md)
- This rollout handoff.

Local controlled evidence is retained under `/private/tmp/assistant-*` and the
isolated release snapshots. The generated credentials/cookies are removed after
cleanup. Screenshots in this chat's visualization directory:
`assistant-production-live.png` and `assistant-production-reviewed-customer.png`.
Automatic email, voice, files, linked WhatsApp and autonomous outreach remain the
separately documented extensions; no customer message was dispatched.
