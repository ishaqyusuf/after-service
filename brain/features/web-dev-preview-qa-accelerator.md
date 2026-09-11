# Web Development And Preview QA Accelerator

## Status

Implemented on 2026-08-30 from the shared Halaalvest/EwaTrade QA accelerator
standard. Database rollout and deployed-preview acceptance remain operational
release steps.

## Purpose

Give authorized afterservice testers one non-production QA entrypoint for the
website, authentication flow, and operator dashboard. A tester authorizes an
exact QA Domain, selects an eligible workspace profile, receives an ordinary
short-lived session, and prepares valid synthetic drafts through typed Quick
Fill recipes.

## Product Boundary

- afterservice has no mobile client, so the shared mobile bootstrap ticket is
  not applicable; its security and recovery requirements remain enforced on web.
- The existing QA email-routing and workspace-purge lifecycle remains the source
  of truth for synthetic identity ownership and cleanup.
- The accelerator never replaces normal sign-in and never enables production.
- Quick Fill prepares drafts only and leaves ordinary validation and submission
  behavior intact.
- Provider-backed, paid, destructive, credential, and secret-bearing workflows
  are excluded unless an explicit safe adapter exists.

## Plan

See `brain/plans/2026-08-30-feature-web-dev-preview-qa-accelerator.md` and the
local ticket batch under `.scratch/web-dev-preview-qa-accelerator/issues/`.

## Implemented Contract

- Internal builds are selected by server-owned `AFTERSERVICE_ENV_MODE` plus
  `QA_ACCELERATOR_ENABLED`; production builds omit all `route.qa.ts` handlers
  and replace QA client modules with inert stubs through Turbopack aliases.
- Capability negotiation is versioned. Production, missing secrets, missing
  exact-domain routes, untrusted browser origins, and version skew fail closed.
- Tester credentials, client authorizations, client identifiers, profile
  references, and audit dimensions are stored only as purpose-separated HMAC
  digests. Failed exchanges use atomic database counters and timed lockouts.
- An authorization lists only non-purging QA workspaces whose
  `qaSourceDomain` exactly matches the authorized domain and which have no
  active or past-due paid subscription. Profile references are short-lived and
  single-use.
- Selecting a profile creates an ordinary Better Auth `Session` tied to the
  authorization, membership, and workspace. API and dashboard context validate
  that scope on every session entry; revocation cascades to derived sessions.
- QA email delivery is allowed only through the configured domain route. SMS,
  phone, WhatsApp, checkout, subscription, and destructive effects fail closed
  unless a registered QA adapter is introduced later.
- Customer, job, follow-up, template, onboarding, and workspace Quick Fill
  recipes are deterministic, draft-only, resettable/regeneratable, and bound to
  the selected QA domain.
  The independent form inventory explicitly records one recipe, prerequisite,
  or exclusion for every owned form category.

## Operator Workflow

1. Configure a non-production mode file using the checked-in examples.
2. Apply migration `20260830010000_qa_accelerator`.
3. Issue a short-lived credential with `bun run qa:credential:issue -- <domain>
   <tester> [hours]`.
4. Open dashboard sign-in, authorize the same exact domain, and select a QA
   workspace profile.
5. Revoke the grant with `bun run qa:credential:revoke -- <grant-id>` when the
   test window ends.

## Verification

- Focused tests cover local-infra mode routing and port ownership, capability
  gating, exact domains, startup refusal, effect policy, deterministic fixtures,
  form coverage, purpose-separated token digests, opaque token shapes, and
  Better Auth cookie signing.
- Deployed preview, provider canary, multi-browser, and first reviewed purge
  evidence remain release-owner actions.
