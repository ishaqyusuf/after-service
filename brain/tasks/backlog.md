# Backlog

## Purpose
This file tracks unstarted work outside the active phase checklist.

## Current Backlog
- Customer self-onboarding job flow.
- High: repair password recovery. Production **Forgot password?** loops back
  to sign-in with `return_to=/forgot-password` (reproduced twice 2026-10-24).
- High: replace publicly visible privacy/terms placeholders with reviewed
  product-specific content and confirm beta support/feedback ownership.
- High: reconcile internal production workspaces with explicit QA classification
  before treating Oversight counts or Logly events as real beta activation.
- Feature candidates after observed beta friction: CSV customer import,
  recurring maintenance/follow-up sequences, and lightweight weekly activation
  reporting. Selection remains pending actual operator evidence.
- Operations assistant extensions (voice/files/WhatsApp/approved automation; core implemented and verified).

## Operations Assistant Integration
Status: core implemented and verified in isolated worktree; see in-progress task
Phase: post-MVP operator workflow improvement
Owner: product/engineering
Plan: [Detailed integration plan](../plans/2026-10-24-feature-operations-assistant.md)
Feature: [Operations assistant](../features/operations-assistant.md)
Context: Add persistent dashboard assistance for customers, jobs, follow-ups,
message drafts, templates, workload reports, settings help and billing navigation.
Acceptance:
- All basic operator workflows have explicit capability/permission coverage.
- Changes use editable proposals, exact confirmation and idempotent receipts.
- Existing domain validation, plan limits and QA effect restrictions apply.
- Text/dashboard release passes isolation, recovery and responsive acceptance.
- Email dispatch remains gated; voice/files/WhatsApp and automation are extensions.
Next step: Hosted pilot activation requires the additive migration and equivalent
server configuration. Extensions remain backlog. Existing MVP rollout work
remains tracked separately; this feature does not mark it complete.

## Customer Self-Onboarding Job Flow
Status: backlog
Phase: post-MVP workflow improvement
Owner: product/engineering
Context: Let operators start a job by entering only customer phone or email, then send a branded afterservice onboarding link so the customer completes profile and service details.
Acceptance:
- Operator can create a job from only phone or email.
- Existing customer matching prevents avoidable duplicates.
- New customer records can exist as incomplete stubs.
- Operator can generate and preview a customer onboarding invite.
- Customer can complete missing details through a tokenized mobile-first page.
- Submitted details update customer/job records and create operator-visible timeline activity.
- No real outbound SMS/email sends occur until provider, consent, and unsubscribe safety are explicitly implemented.

## Intake Template
```md
## <Task Name>
Status: backlog
Phase:
Owner:
Context:
Acceptance:
```
