# Backlog

## Purpose
This file tracks unstarted work outside the active phase checklist.

## Current Backlog
- Customer self-onboarding job flow.
- High: deploy the locally verified password-recovery repair and finish
  production acceptance. The human reset succeeded locally; recovery, delivery
  and token regressions pass. See `../features/password-recovery.md` for the
  remaining success-navigation/sign-in acceptance and rollout boundary.

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
