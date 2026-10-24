# 0027: Publish operator-specific legal notices

Date: 2026-10-24
Status: implemented and production verified

## Context

Public privacy/terms pages still contained scaffold placeholders and a retired
payment-provider reference. The founder requested legal/support readiness after
adoption reporting and actual queued email acceptance.

## Decision

Identify the founder-confirmed registered operator as Zeroes and One Hi-Tech,
Nigeria, trading as afterservice. Use the founder-confirmed monitored
hello@afterservice.app mailbox for public support and privacy requests.
Describe the actual service, provider and optional AI data paths; distinguish
business customer records from account/service information. Explain rights and
support routes without inventing retention SLAs, certifications, registration
numbers, universal refund exclusions or cross-border adequacy findings.

Keep the product brand afterservice. Public notices are server-rendered and
share a small semantic legal-page component. No auth, permission or data model
changes are needed. Publish from isolated current-production source with only
those three source files overlaid, preserving concurrent deployed features.

## Consequences

Support/privacy requests require founder handling and identity/authority checks.
Future provider, retention, product or billing changes must update these notices.
Publishing notices is not an independent legal compliance certification or a
replacement for review of operational contracts and transfer arrangements.
See `brain/features/legal-and-support-readiness.md` for evidence and release.
