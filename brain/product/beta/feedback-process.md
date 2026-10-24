# Beta Feedback And Triage

Prepared: 2026-10-18
Owner: Founder

## Reply Channel

Use the same direct conversation in which the founder personally invited and
onboarded the operator. Explicitly confirm that channel during onboarding.
The founder checks it each business day during the pilot. A forwarded invite
must identify the founder's real reply destination before it is sent.

The founder confirmed on 2026-10-24 that `hello@afterservice.app` works and is
monitored. This is the public support and privacy-request address. The existing
onboarding conversation remains available during the pilot; no fixed response
SLA is promised.

No new external inbox, group, form, or notification automation was created.

## Ask Operators To Send

- What they were trying to do.
- Page or feature name.
- What happened instead.
- Approximate time and device/browser.
- Whether it blocked work and whether they found a workaround.
- An optional screenshot with customer information removed.

Never request passwords, session tokens, full customer lists, or message bodies
containing private customer details. Record a workspace ID only when needed to
investigate; keep direct contact details in the founder's existing contact system.

## Triage Order

| Priority | Example | Founder action |
|---|---|---|
| P0 | Data loss, another workspace's data visible, unintended customer delivery | Stop affected pilot actions, preserve the report, investigate immediately |
| P1 | Cannot sign in/onboard/save the core workflow | Reproduce promptly, offer a verified workaround, track until resolved |
| P2 | Confusing date, draft, filter, or mobile layout | Capture steps and impact; prioritize by repeated operator friction |
| P3 | New integration, automation, or reporting request | Record the actual need and frequency before promising scope |

Priority expresses handling order, not a response-time guarantee. Acknowledge
reports in the confirmed conversation; give a next update only when agreed.

## Capture Template

Copy a dated entry into `brain/marketing/feedback.md`:

```md
### YYYY-MM-DD: BETA-<prospect id> — <short observation>
Segment:
Channel: founder's confirmed onboarding conversation
Workspace ID, if needed:
Observed task:
Expected result:
Actual result:
Device/browser and approximate time:
Priority / workflow blocked:
Workaround:
Operator quote (with permission, no customer details):
Owner: Founder
Next action / agreed update:
Status: new | investigating | fixed-pending-check | verified | deferred
Verification evidence:
```

## Weekly Review

Review signups, first customer/job/follow-up, first real logged contact, and
return usage. Separate observed usage from operator statements. Record the top
five friction points and whether fixes changed behavior. The first pilot target
is five workspaces and three teams completing a real follow-up workflow;
weekly habit and willingness to pay are later validation gates.
