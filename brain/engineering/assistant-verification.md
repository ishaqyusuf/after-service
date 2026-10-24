# Operations Assistant Verification And Configuration

Updated: 2026-10-24
Worktree: `/Users/M1PRO/.codex/worktrees/operations-assistant/after-service`
Branch: `codex/operations-assistant`
Baseline commit: `01050a3` (copied existing workspace state; main checkout untouched)

## Runtime Configuration

`.env.example` documents the server-only variables with the feature disabled.
Set server-side values through the existing secret/environment workflow:

- `AFTERSERVICE_ASSISTANT_ENABLED=true` enables the feature.
- `ASSISTANT_AI_PROVIDER=deepseek` and `ASSISTANT_AI_MODEL=deepseek-flash` select
  the owner-selected provider. `ASSISTANT_DEEPSEEK_API_KEY` is the dedicated key.
- Optional `AFTERSERVICE_ASSISTANT_WORKSPACES` is an exact comma-separated
  workspace allowlist. Optional `AFTERSERVICE_ASSISTANT_CAPABILITIES` limits
  mutation capability IDs from the manifest.
- `AFTERSERVICE_ASSISTANT_MONTHLY_TOKENS` defaults to a 1,000,000-token pilot
  allowance. Admission reserves 128,000 tokens per bounded turn and reconciles
  actual usage; a smaller positive allowance prevents admission, not an implicit
  fallback to a larger budget. This is a configurable pilot policy, not pricing.
- OpenAI remains supported with its dedicated server-only key and model allowlist.

No key is stored in source, browser configuration, analytics, screenshots, or
Brain docs. Hosted deployments require the additive migration and equivalent
server configuration before enablement. This task does not deploy production.

## Local Test Isolation

Use the existing local PostgreSQL service and a separate database named
`afterservice_assistant`. The recorded verification used loopback port 55433.
Supply its `DATABASE_URL`, `AFTERSERVICE_ENV_MODE=local`, a local auth secret and
the exact local trusted origins through your normal environment runner. No jobs
worker is needed for ordinary assistant acceptance.

```sh
bun install
bun run db:generate
bunx prisma db push --config packages/db/prisma.config.ts
bun run test:assistant
bun run test:typecheck
bun run typecheck
bun run test:assistant:e2e
```

The browser config refuses any database other than the isolated local target.
It starts `https://assistant-afterservice.localhost` and a loopback-only model
fixture server. Only the model is replaced: the real streaming implementation,
read/draft tools, auth, database and confirmation endpoints execute unchanged.
The fixture endpoint requires a synthetic `browser-*@afterservice.invalid` user.
No cloud request, customer notification or billing action is made by this suite.

The existing local environment loader is outside the managed worktree. During
this session `/private/tmp/afterservice-assistant-run.ts` read the existing local
profile without copying secrets and redirected the database to the isolated
target. That temporary launcher is execution evidence, not a runtime dependency.

## Verification Evidence — 2026-10-24

- Assistant contracts and real PostgreSQL: **19 passing tests / 95 assertions**.
  All 19 action IDs have canonical mappings. Coverage includes scoped reads,
  actor-private chats, current membership/role checks, draft/edit/cancel/expiry,
  stale versions, concurrent confirmation, rollback, receipts, all basic domain
  mutations, history pagination, plan/origin/capability gates and token recovery.
- Existing unit regressions: **107 passing tests / 275 assertions**.
- Existing MVP/QA PostgreSQL regressions: **45 passing tests / 157 assertions**.
- Desktop Chromium and Pixel 7 viewport: **eight passing cases**, covering
  draft/edit/confirm/reload/normal customer visibility, unsent message cards,
  workload, saved chats, rename/new chat, input and edited-message preservation,
  focus restoration, dark mode, onboarding help, horizontal fit, provider-error
  input recovery/retry, exhausted allowance and chat deletion.
- Full monorepo typecheck (15 tasks) and test-harness typecheck passed.
- Standard Node Next.js production dashboard build passed with
  `AFTERSERVICE_ENV_MODE=production` and `QA_ACCELERATOR_ENABLED=false`, against
  the isolated local database. Assistant page/chat routes are present; internal
  QA access endpoints are absent. API Bun bundle passed (2,037 modules).
- Generated additive migration applied only to the isolated local database.
- Scoped Biome (52 changed source/config files) and whitespace checks pass.

## Controlled Real DeepSeek Acceptance

The owner authorized a dedicated key named
`AFTERSERVICE_ASSISTANT_DEEPSEEK_API_KEY`. It is configured only in the worktree's
ignored root `.env.local` with mode 0600; the existing local environment loader
reads that file. The actual secret is not in source or evidence.

Seven synthetic scenarios passed with the configured `deepseek-flash` provider,
using the actual chat runtime, tool schemas and local PostgreSQL. A customer was
created only after explicit harness confirmation, and remaining fixtures were
removed afterward. Fixture setup is record-only; outbound credentials are blank
and no worker runs.

| Scenario | Reply time | Measured tokens |
| --- | ---: | ---: |
| Accurate overdue queue | 2.498 s | 10,174 |
| Editable customer creation, then explicit confirmation | 2.462 s | 10,119 |
| Job draft with exact NGN amount and Lagos time | 3.486 s | 15,630 |
| Editable unsent check-in | 5.961 s | 21,170 |
| Deterministic period report | 2.632 s | 10,387 |
| Current billing and product help | 2.388 s | 10,533 |
| Refusal of SQL/deletion/automatic WhatsApp | 2.550 s | 5,070 |

Successful run total: **83,083 tokens**. These are observed synthetic latencies
and token usage, not a general accuracy or performance guarantee. Earlier setup
attempts also consumed provider usage. The real-provider check caught and fixed
DeepSeek's top-level object schema requirement: `draftAction` wraps the typed
union in `{ proposal: ... }`; server draft/action contracts stay unchanged.
Provider failures log only provider/model labels, never SDK request bodies.

Opt in explicitly with the isolated local environment loaded:

```sh
ASSISTANT_LIVE_ACCEPTANCE=true bun tests/support/assistant-live-acceptance.ts
```

This sends synthetic business details to the configured provider and consumes
its account balance. The script refuses other database names and removes its
own synthetic user/workspace. It is excluded from routine provider-free tests.

## Retention And Operational Inspection

Chats, text, cards and proposal content remain until the operator deletes the
conversation or the workspace is deleted. Draft execution expires after 30
minutes; expiry does not itself delete chat content. Minimal business receipts
survive chat deletion and are removed with the actor/workspace. Unknown running
turns are recovered after three minutes with conservative reserved usage.
Run rows record provider/model, prompt version, lifecycle, timestamps, measured
usage and bounded error codes; proposals persist their capability version.
No assistant transcript or customer content is sent to product analytics.

## Release Boundary

Implementation and isolated acceptance do not activate hosted environments.
Hosted activation requires the additive migration and server configuration.
Real customer email delivery, voice, file intake, linked WhatsApp, autonomous
outreach and team administration remain the separately documented extensions.

## Brain Documentation Impact Manifest

- [Feature behavior](../features/operations-assistant.md)
- [Service job currency](../features/service-jobs-mvp.md)
- [Integration plan](../plans/2026-10-24-feature-operations-assistant.md)
- [ADR 0018](../decisions/0018-add-reviewed-operations-assistant.md)
- [API endpoints](../api/endpoints.md)
- [API contracts](../api/contracts.md)
- [API permissions](../api/permissions.md)
- [Database schema](../database/schema.md)
- [Database relationships](../database/relationships.md)
- [Database migration](../database/migrations.md)
- [Architecture](../system/architecture.md)
- [Observability](../system/observability.md)
- [Testing](testing.md)
- [Project index](../PROJECT_INDEX.md)
- [Backlog](../tasks/backlog.md)
- [In progress](../tasks/in-progress.md)
- [Done](../tasks/done.md)
- [Roadmap](../tasks/roadmap.md)
- This verification/configuration record.
