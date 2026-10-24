# Backlog

## Purpose
This file tracks unstarted work outside the active phase checklist.

## Current Backlog
- Customer self-onboarding job flow.
- High: deploy the locally verified password-recovery repair and finish
  production acceptance. The human reset succeeded locally; recovery, delivery
  and token regressions pass. See `../features/password-recovery.md` for the
  remaining success-navigation/sign-in acceptance and rollout boundary.
- High: replace publicly visible privacy/terms placeholders with reviewed
  product-specific content and confirm beta support/feedback ownership.
- High: reconcile internal production workspaces with explicit QA classification
  before treating Oversight counts or Logly events as real beta activation.
- Feature candidates after observed beta friction: CSV customer import,
  recurring maintenance/follow-up sequences, and lightweight weekly activation
  reporting. Selection remains pending actual operator evidence.
- Operations assistant extensions (voice/files/WhatsApp/approved automation; core implemented and verified).

## Operations Assistant Integration
Status: core merged, deployed and live verified; see production rollout record
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
Next step: Observe operator use and gather feedback before selecting extensions.
The production migration/provider configuration and live verification are
complete; see `brain/handoffs/2026-10-24-assistant-production-rollout.md`.
Existing MVP rollout work remains tracked separately.

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
