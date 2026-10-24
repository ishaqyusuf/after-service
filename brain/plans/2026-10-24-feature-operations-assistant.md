# Operations Assistant Integration Plan

Date: 2026-10-24
Status: implemented and verified in `codex/operations-assistant`; hosted activation separate
Scope: Ewatrade-style assistance for the existing afterservice operator workflows
Feature: [Operations assistant](../features/operations-assistant.md)

## Goal And Release Boundary

An operator can ask about their work, find a record, prepare a change, review it,
and save it without leaving the dashboard. The first complete release covers
customers, completed jobs, follow-ups, message drafting, templates, workload
summaries, settings assistance, and billing explanations/navigation.

Build dashboard text chat first. Voice, files, linked WhatsApp chat, public
website assistance, and autonomous messaging are separate extensions. Responsive
dashboard support is part of the first release; a native mobile app is not.
This plan is implemented and verified locally; it does not activate hosted environments.

## Evidence And Reference Choice

Reviewed local sources:

- Ewatrade `packages/assistant/src/capabilities/{types,manifest}.ts`: explicit
  capabilities, canonical procedure mappings, roles, rollout, effects, and tests.
- Ewatrade `apps/api/src/assistant/general-chat-route.ts`: authenticated Hono
  streaming, bounded input, persisted run lookup, and safe failure responses.
- Ewatrade `.brain/features/assistant-business-operations.md`: scoped reads,
  editable proposals, exact review, explicit confirmation, and saved receipts.
- Ewatrade `.brain/features/global-assistant-fab.md`: persistent dashboard
  launcher, minimize/expand, navigation persistence, scope resets, and focus.
- Ewatrade `.brain/features/assistant-allowance.md`: shared business allowance
  and visible remaining usage. Its allowance amount is specific to Ewatrade.
- Ewatrade `packages/ai/src/{runtime-config,provider}.ts`: server-selected
  providers/models and credential handling.
- Afterservice `apps/api/src/routers/_app.ts`, Prisma schema, navigation, overview
  queries, and the matching Brain feature/API/permission documents.

Adapt the patterns and contracts into `@afterservice/*`; do not introduce an
Ewatrade runtime dependency or port its commerce, stock, accounting, or booking
features. Use Midday shell/sheet/form/tRPC conventions for dashboard integration.
Ewatrade source and historical checkpoints do not establish availability of any
Afterservice feature.

Official technical references, checked 2026-10-24:

- [AI SDK tools and tool calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)
- [AI SDK chat tools and interactive confirmation](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage)

These support the proposed typed tools and streamed interactive cards. Ewatrade
currently pins AI SDK 6 while the current documentation defaults to v7; choose
and pin a compatible version during foundation work and verify its exact APIs.
Do not combine this integration with an Ewatrade upgrade.

## First-Release Feature Coverage

| Area | Assistant coverage | Canonical integration / constraints |
| --- | --- | --- |
| Product help | Explain the board, statuses, channels, templates, and next steps; open the relevant screen | Small curated, versioned product-help content; no vector database initially |
| Customers | Search, view history, add, edit contacts/tags/notes, archive with review | `customers.list/get/tags/create/update/archive`; match ambiguous names before drafting; no automatic merging |
| Service jobs | Search, view, record completed work, edit supported fields/status, create a linked follow-up | `serviceJobs.list/get/create/update/markCompleted/createFollowUp`; preserve customer/job ownership and monetary units |
| Follow-ups | Find due/overdue/upcoming/waiting/replied work; create, edit, reschedule, assign/unassign, record contact/reply, close | `followUps.listBoard/listTable/get/create/update/reschedule/assignOwner/markSent/markReplied/close`; add a safe active-member directory read for assignment |
| Message drafting | Draft check-ins, review requests, issue-resolution replies, repeat-service and referral messages; shorten, personalize, change tone | Editable content using real customer/job context; never invent a review URL, offer, customer reply, or service outcome |
| Contact and sending | Record an operator's completed phone contact; hand off email to existing send form initially | Phone logging invokes no telephony; direct assistant email dispatch is conditional on the sending gate below; SMS/WhatsApp content is a draft/manual handoff |
| Templates | Find, preview, create, edit, archive, set default; adapt text for a channel | `templates.list/get/create/update/archive/setDefault`; retain supported merge tags and plan limits |
| Daily operations | Explain today's queue, prioritize overdue work with reasons, show pending replies and linked records | `dashboard.overview` plus bounded canonical list queries; prioritization is advice until a reviewed action is saved |
| Basic reporting | Summarize jobs, due/overdue work, logged contacts, replies, closures and channel mix over explicit supported periods | Add deterministic aggregate queries where missing; return period, timezone, filters, as-of time and record links; distinguish recorded contact from verified delivery |
| Onboarding assistance | Explain setup fields, suggest cadence/templates, help prepare the first customer/job/follow-up after workspace creation | Keep signup and workspace creation in existing forms; setup helper before workspace creation uses curated help only |
| Workspace settings | Explain and propose business name/type, service category, default follow-up delay changes | `workspace.getCurrent/updateSettings`; settings mutation requires owner/admin and exact before/after review |
| Billing and usage | Explain current plan, usage, limits and Free Beta; navigate to billing/portal | `billing.getCurrentPlan`; owner/admin portal handoff only, preserve paid-checkout flag; no assistant subscription/payment mutation |
| Existing team | Resolve permitted assignees and show basic membership labels needed for work | New minimal authorized directory endpoint; invitation, removal and role management require separate canonical team features |
| Conversation basics | Streaming, saved threads, new/rename/delete chat, contextual suggestions, stop/retry, resume, draft editing and receipts | Actor-private conversations within the active workspace; retained business audit receipts are separate from deleted chat content |

Review-request and referral assistance means preparing ordinary follow-ups and
copy. It does not introduce review-provider integrations, automatic sentiment
classification, discounts, referrals tracking, or repeat-revenue attribution.
The existing schema does not establish those outcomes.

## User Experience

- One authenticated dashboard launcher opens directly into the latest chat,
  with a dedicated `/assistant` page for longer work.
- Desktop: compact panel with an in-place expand option. Small viewports: full
  height sheet with safe insets and keyboard-aware composer.
- Minimize/reopen and dashboard navigation preserve the same mounted chat and
  unsent input. Account/workspace changes clear transient context immediately.
- Customer, job, and follow-up sheets offer “Ask assistant” with authorized record
  context. The server re-resolves identifiers; route parameters are hints only.
- Results use compact linked record cards. Draft changes show editable fields,
  exact dates, recipients, channels, and a before/after comparison when editing.
- Missing required facts are requested together; optional fields do not block a
  basic action. Multiple matching records require a choice.
- A Confirm button saves a specific reviewed revision. Plain “yes” in chat does
  not execute a write. Edit and Cancel remain available before confirmation.
- A saved receipt links to the actual record, and the normal table/board queries
  are invalidated. Errors retain the draft with a specific recovery action.
- New chat, history, loading/retry, disabled/unconfigured, quota, empty/no-match,
  permission-denied, stale-draft, and interrupted-stream states are explicit.
- Keyboard access, focus return, screen-reader labels, readable streaming, dark
  mode, and mobile fit are acceptance requirements.

Example flow: “Log Musa's AC repair from yesterday for ₦25,000 and check on him
Friday.” Resolve the customer, show the completed-job draft and explicit local
dates/currency, then review the linked follow-up. If more than one Musa exists,
ask which one. Multiple writes remain separate reviewed actions unless a canonical
atomic composite command has been implemented and tested.

## Technical Shape

### Ownership

- `packages/assistant`: capability manifest, typed action/proposal contracts,
  prompt versions, presentation contracts, timezone/money parsing and fixtures.
- `packages/ai`: server-only provider adapter and validated runtime selection;
  model/provider identifiers never come from browser input.
- `apps/api/src/assistant`: tool adapters, scope checks, streaming, proposal
  lifecycle, execution and recovery. `apps/api/src/routers/assistant.ts` owns
  conversation/proposal/usage tRPC procedures.
- `apps/dashboard/src/components/assistant`: shell, messages, record cards,
  composer, history, draft editors, reviews, receipts and focused handoffs.
- `packages/db`: persistence and deterministic scoped queries/commands.
- `packages/jobs` / `packages/notifications`: existing outbound delivery;
  ordinary chat does not depend on a jobs worker.
- `packages/events`: bounded assistant event metadata through existing Logly
  instrumentation, without customer text or chat content.

The dashboard uses a same-origin `/api/assistant/chat` streaming proxy to the
shared Hono implementation. Reuse existing validated session forwarding,
abort signals, error mapping and exact-origin rules; do not expose service keys
or rely on cross-host browser cookies. tRPC owns non-streaming operations.

### Proposed Persistence

- `AssistantConversation`: workspace, actor, title, timestamps and deletion state.
- `AssistantMessage`: ordered message/typed-card data and run association.
- `AssistantRun`: admission/running/completed/failed/interrupted state, lease,
  provider/model/prompt version and safe timing/usage metadata.
- `AssistantProposal`: capability/version, target IDs, validated payload,
  expected record versions, revision, payload digest, expiry and lifecycle state.
- `AssistantActionReceipt`: proposal revision, actor/workspace, idempotency key,
  outcome, record references and timestamps.
- `AssistantUsage`: workspace/month token accounting and concurrent reservations.

All private reads require both workspace membership and conversation ownership.
No team-wide transcript browsing is implied. Proposal/receipt relationships are
workspace-consistent. Add indexes for workspace/actor chronology, run state,
proposal expiry and unique confirmation/usage identities.

Document chat retention, user deletion, retained minimal business audit and QA
workspace purge behavior during implementation. Deleted chat content must not
remain in denormalized tool payloads or analytics. Broader account export and
attachment retention are extension work; no attachments enter first release.

### Action Execution Contract

1. Resolve live session, membership, actor, workspace, enabled capabilities and
   limits on every read, draft, confirmation and recovery request.
2. Read canonical records. The model receives bounded selected fields, never
   unrestricted database/schema access or a SQL/shell tool.
3. Validate the proposed action with Zod and authoritative relationship checks;
   save a draft with a versioned payload and exact review projection.
4. Editing creates a new revision and invalidates previous confirmations.
5. Confirmation names the proposal, revision and digest through a same-origin,
   authenticated request. Recheck permissions, limits, expiry and target versions.
6. Atomically claim the action, run the canonical domain command and persist its
   receipt. Use a unique idempotency key and transaction for local record writes.
7. Reloads, retries and concurrent confirmations return the same receipt. Stale,
   revoked, foreign, canceled or expired proposals execute nothing.

Existing routers contain inline writes, some spanning multiple statements.
Extract only the required commands so forms and assistant share validation,
permissions, transactions and event semantics. Calling a router and writing the
receipt afterward is insufficient for atomic confirmation. Notifications and
analytics must not run inside a retryable database transaction.

The model can call read and draft tools. It receives no confirmation executor.
Read results and customer notes are untrusted data, never policy instructions.
Every capability names its canonical operation, allowed roles, effect, supported
UI and acceptance tests. Unsupported requests explain the available form/workflow.

### Dates, Amounts, Reporting And Access

- Reuse the operator timezone/calendar behavior from the follow-up board. Resolve
  “tomorrow”/“Friday” against the request clock and zone and show the exact local
  date/time before saving. Ask when time or zone is materially ambiguous.
- Parse stated amounts as decimal major units and convert exactly to existing
  cents fields. Do not infer workspace currency: the schema does not currently
  establish a canonical operational currency. Make currency explicit in review;
  introduce durable workspace currency only as a separately documented decision.
- Aggregate deterministically, paginate record results and label bounded results.
  Define period/cohort/denominator before adding response rates; exclude claimed
  revenue recovery, verified review conversion and invented customer outcomes.
- Owner/admin/staff ceilings must match actual server enforcement. Brain mentions
  assigned/visible staff scope, but operational routers inspected use workspace
  scope; audit and resolve this mismatch before claiming assignment-only access.
  Never use the prompt as the missing permission boundary.
- Settings and billing retain their existing owner/admin restrictions. Team role
  edits, invitations, platform QA administration and secret access are excluded.

### Runtime, Cost And Privacy

- Feature flag plus workspace pilot allowlist and capability allowlist; disabled
  chat leaves all existing manual workflows usable.
- Server-configured provider/model using the Ewatrade adapter pattern. Final
  model selection follows a small quality/latency/cost evaluation, not a hardcoded
  promise to use Ewatrade's selected model.
- Workspace monthly token allowance shared across actors; show remaining tokens
  and reset time. Set the beta allowance after measuring representative turns;
  do not copy Ewatrade's 5-million-token policy automatically.
- Reserve bounded usage under concurrency, reconcile actual usage on completion,
  cap context/tool steps/output, and recover abandoned reservations safely.
- Apply message-size, request-rate, concurrency and timeout limits. Stop cancels
  generation, not a previously committed action; recovery reads saved run state.
- Log capability/outcome/error category, tokens and latency without prompts,
  customer details, messages or provider secrets. Configure provider data handling
  and disclose processing before enabling real customer-data use.

## Sending Gate

First release can draft all supported channel content and open the existing send
form. Explicitly recorded phone contact is available as a reviewed local action.
Direct assistant email sending may be enabled only after:

- Trigger credit/configuration and a controlled routed email canary pass. Current
  Brain records a credit blocker; recheck it rather than assume it is resolved.
- Confirmation shows exact follow-up, recipient, subject/body and channel.
- A durable send intent/outbox and stable dispatch key prevent duplicate sends
  across queue acceptance, timeouts and retries; unknown outcomes are reconciled
  before another dispatch. Persist the intent before provider work.
- Queue failure cannot create a successful-contact receipt. UI distinguishes
  draft, queued, provider-delivered/failed when known, and manually recorded.
- Existing QA effect routing, plan gates and recipient validation remain enforced.

Scheduling a follow-up remains a board task; it does not schedule an automatic
send. SMS/WhatsApp dispatch, inbox ingestion and delivery callbacks require their
own provider contracts. No new worker, send, provider activation or production
configuration is authorized by this planning document.

## Delivery Sequence And Acceptance

| Phase | Concrete deliverable | Exit gate |
| --- | --- | --- |
| 1. Foundation | Capability inventory, pinned SDK/provider interface, persistence, auth, allowance, flags, same-origin stream and actor-private history | Isolation, role revocation, run recovery and provider-free transport tests pass |
| 2. Useful read-only slice | Dashboard launcher/page, product help, record search/history, today/overdue summaries and linked cards | A real operator can answer “What needs attention today?” and resume a saved chat; no business mutation tools |
| 3. Customers and jobs | Editable create/update/archive proposals, domain command extraction, exact review, receipts, form handoff | Create/edit/reload, stale refusal, double-confirm and transactional failure tests pass; job/customer consistency preserved |
| 4. Complete follow-up work | Create/reschedule/assign/contact/reply/close, message drafting, templates, timezone handling and cache refresh | Customer → job → follow-up → drafted message → manual contact → reply → close passes through chat and ordinary UI |
| 5. Complete basic assistant | Supported period reports, settings, onboarding help, billing navigation, allowance display, accessibility and responsive polish | Every first-release capability passes its role/limit/error/empty-state cases; deterministic fixture reports match normal UI |
| 6. Pilot and release | Controlled live-provider evaluation, preview acceptance, selected workspace rollout, observability and rollback | Desktop/mobile viewport and real-model acceptance pass; no unauthorized effects; sending remains handoff-only until its gate passes |

A rough planning allowance for phases 1–6 is 10–15 focused engineering days,
subject to foundation findings and canonical-command extraction. This is an
estimate, not a delivery commitment; reassess after phase 2. Provider restoration,
outbox work and the extensions below can add time independently.

## Later Extensions

1. Voice dictation: record → transcribe → editable transcript → ordinary draft
   and review. Private storage, cleanup, separate allowance and provider/device
   acceptance precede enablement. Voice never bypasses confirmation.
2. File-assisted intake: bounded CSV/spreadsheet customer import and document/image
   extraction with row preview, matching, validation and explicit import review.
   Uploaded text is untrusted; attachments require new storage/retention contracts.
3. Linked operator WhatsApp assistant: verified account connection, current
   workspace selection, scoped reads/drafts and expiring authenticated review
   links. Keep it separate from messaging customers through WhatsApp.
4. Public website help: curated product/pricing answers and signup navigation,
   without access to private operational data.
5. Approved automation: reminders, recurring cadence and scheduled outreach only
   after opt-in, cancellation, consent/opt-out and provider delivery semantics.
6. Team management: invitations/roles/lifecycle only after canonical team APIs,
   ordinary UI, permissions and audit coverage exist.

Live calls, autonomous customer support, payments/refunds, inventory, accounting,
bookings, and medical advice are outside this integration.

## Verification Plan

- Unit: schema/manifest coverage, exact amount/date conversion, prompt injection
  boundaries, budget accounting, typed cards and missing/ambiguous facts.
- Local PostgreSQL integration: actor/workspace isolation, role revocation,
  plan limits, transactional rollback, revision/expiry checks, repeated and
  concurrent confirmation, one receipt, and domain event consistency.
- Transport: same-origin admission, CORS, malformed/oversized inputs, streaming,
  timeout/abort, bounded errors and recovery without rerunning writes.
- Browser: launcher/persistence, search/cards, edit/cancel/confirm, normal record
  visibility, history/delete, blocked provider/quota, focus/keyboard, dark mode,
  desktop and mobile viewport. Use the existing local Portless test setup.
- Deterministic model fixtures first; controlled real-provider scenarios then
  check intent resolution, tool choice, drafting quality, latency and token cost.
- Run relevant package tests, `bun run typecheck`, `bun run test:typecheck`,
  affected existing unit/integration/browser cases, scoped lint and dashboard/API
  builds before release. Email QA uses the separately controlled worker slice.
- Acceptance means saved records and receipts agree with the normal dashboard;
  a plausible model reply alone does not pass.

## Brain Impact At Implementation

Update schema/relationships/migrations docs for new persisted models; API
endpoints/contracts/permissions for new routes and action semantics; architecture
and observability for runtime ownership; affected feature docs and testing for
behavior/acceptance; task records and roadmap for actual progress. Record final
architecture and rollout decisions in an ADR when adopted.

Implementation updated the matching runtime, API, database, architecture and task
documents. The verification record contains the complete Brain impact manifest.

## Implementation Checkpoint — 2026-10-24

Core contracts, six persisted assistant models, scoped read/draft tools, exact
review/confirmation, canonical transactional operations, saved receipts, usage
reservations and dashboard integration are implemented in the isolated worktree.
Unit/integration, eight desktop/mobile browser cases, typechecks, builds and
seven controlled real DeepSeek scenarios pass. See
[verification and configuration](../engineering/assistant-verification.md) and
[ADR 0018](../decisions/0018-add-reviewed-operations-assistant.md).

The monetary implementation uses per-job currency rather than a new workspace
currency setting. Legacy records remain USD; no conversion or reinterpretation.
Onboarding help remains curated, and signup/workspace creation stay in forms.
