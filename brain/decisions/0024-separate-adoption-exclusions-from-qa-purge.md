# 0024: Separate adoption reporting exclusions from QA purge eligibility

Date: 2026-10-24
Status: implemented and production reporting acceptance passed

## Context

Four production workspaces are currently classified normal: two founder/admin
businesses and two documented verification fixtures. Existing QA adoption
requires a configured QA-domain owner and also makes a workspace eligible for
the separately reviewed QA purge lifecycle. Reporting cleanup must not change
access, identity lanes or retention merely to correct adoption metrics.

## Decision

Use the server-owned `ADOPTION_EXCLUDED_WORKSPACE_IDS` comma-separated list for
reviewed internal/test workspaces. Match exact IDs; reject malformed config.
Oversight excludes those IDs from all directories, totals and daily series,
in addition to existing QA/purging exclusions. An account with only excluded
memberships is excluded; an account with another live membership remains, and
an account without memberships remains a registration rather than an active
business. Future server analytics events carrying excluded workspace IDs are
suppressed before IDs are stripped from the Logly payload.

No schema, membership, auth, customer data or purge eligibility is changed.
Configuration is reversible and independent of the read-only DB grant.

## Limits

Historical anonymous Logly events cannot be reliably relabelled by workspace:
the existing SDK omitted workspace/actor IDs. Anonymous page visits also remain
traffic signals, not verified operator adoption. The analytics guard requires
the new shared module and configuration in every server emitting those events,
including the dashboard's same-origin API; an API-only deployment is insufficient.

The founder confirmed on 2026-10-24 that both Zeroes & One and Owner are
internal/test. The other two fixtures have separate documentary evidence.
Current jobs only read Logly for analytics reviews; they do not emit product
events, so this rollout requires API and dashboard producers only.
