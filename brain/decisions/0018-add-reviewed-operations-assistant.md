# 0018. Add A Reviewed Operations Assistant

Date: 2026-10-24
Status: adopted for implementation; hosted activation remains separate

## Context

The owner requested Ewatrade-style assistance across basic operator workflows,
implemented in a separate worktree. Existing forms use canonical tRPC operations;
some operations dispatch notifications and several contain multiple writes.

## Decision

- Add `@afterservice/assistant` for contracts/capabilities and `@afterservice/ai`
  for the server-only provider adapter, using Ewatrade's pinned AI SDK 6 pattern.
- Keep conversations private to an actor inside their current workspace. Recheck
  membership on reads, drafts, edits, confirmation and recovery.
- Models receive scoped read and draft tools only. The UI confirms an exact
  proposal revision/digest, with expected record versions and an expiry.
- Add optional server-owned transaction/record-only/after-commit context to
  canonical operations. Execute local business changes and the unique receipt
  in a serializable transaction; retry wrapped serialization conflicts. Optional
  analytics runs after commit, and assistant scheduling invokes no notification.
- Use the actual current workspace access policy for staff, as implemented by
  existing domain operations. Do not claim assignment-only row access.
- Begin email with an existing-form handoff; phone logging records a completed
  operator call. No assistant provider dispatch or automatic send is introduced.
- Add per-job currency (`USD`, `NGN`, `GBP`, `EUR`, `CAD` at the API boundary),
  defaulting legacy jobs to USD. Store exact integer cents and display the saved
  currency; never convert an operator's stated money automatically.
- Reserve bounded workspace/month token usage before generation and reconcile
  actual usage. An expired run with unknown provider usage consumes its reserved
  amount. Feature, workspace and capability flags remain server-owned.
- User selected a dedicated DeepSeek key. Default DeepSeek model is
  `deepseek-flash`, with thinking disabled for ordinary operational tool calls.
  The dedicated key is configured in ignored local worktree configuration; seven
  controlled real-model scenarios passed. Hosted activation is separate.

## Consequences

Add six assistant tables and one additive job column. Deleting a conversation
cascades private messages, runs and proposals, while minimal saved record receipts
remain workspace/actor scoped. Workspace deletion cascades all assistant data.
Global record sheets live inside the authenticated assistant scope so contextual
entry points share the same provider. Sign-out/account/workspace changes unmount
that provider. No Ewatrade runtime dependency or commerce feature is copied.

Reference: `brain/plans/2026-10-24-feature-operations-assistant.md`.

## Production Build Runtime

Next.js 16.3 compiled and typechecked under Bun 1.3.9 but its production page-data
worker failed loading the CommonJS app-page runtime (`Expected CommonJS module
to have a function wrapper`). The dashboard build script invokes Next's standard
Node CLI; Bun remains the package manager/task runner. Verify the resulting
production build rather than interpreting compilation alone as acceptance.

## Provider And Baseline Compatibility

DeepSeek requires an object-root tool schema. Wrap the action union in a typed
`proposal` property only at the model-tool boundary; retain strict domain action
validation and exact reviewed confirmation. Suppress raw SDK failure logging.
Runs record prompt versions and drafts record capability versions.

The copied workspace baseline had Polar SDK 1.0.2 with source written for 0.34.17.
Pin the API package to 0.34.17 for the compatible baseline; do not pull unrelated
ongoing Polar migration edits from the original checkout into this feature.
