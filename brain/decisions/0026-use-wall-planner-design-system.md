# Use Wall planner across marketing and dashboard

Date: 2026-10-24
Status: accepted by owner; implementation tracked by the migration contract.

## Decision

The owner selected Wall planner (direction 01) for both surfaces. Marketing
revision `4f92a91c-db40-438b-9ece-37026ade63e7` and dashboard revision
`98a41e00-e71d-4cfe-8030-12445392ad4e` are recorded in shared Workshop.
`DESIGN.md` captures the resulting visual system. This supersedes ADR 0010's
presentation choice while preserving its product story and operational truth.

Apply the design to existing React components and app/package architecture.
Keep TanStack tables, URL-backed sheets, current domain forms, sidebar/mobile
menu, tRPC boundaries and authorization. Use app-local semantic theme overrides;
do not fork shared shadcn primitives. Cal Sans display and Inter interface fonts
are self-hosted. No new UI framework or runtime mock-data engine is introduced.

## Sheets and modals

Use Midday customers/invoices as the canonical analogues. Navigable record
create/edit/details and ongoing follow-up work belong in sheets. Short
confirmations and transient search/interruption flows belong in dialogs.
Billing/settings remain pages. A phone sheet occupies available viewport width
and scrolls vertically. A phone board presents labelled stage controls with one
lane visible; desktop retains five stages. Tables preserve their functionality
and confine horizontal scrolling to their own region.

## Constraints and consequences

Current pricing, checkout, assistant, onboarding recovery, branding, SEO, consent,
analytics and PWA behavior supersede stale preview copy. The redesign introduces
no schema, billing or provider contract. Server-derived facts and operator
timezone determine overview data. Workshop sample records are illustrative only.

Claude `claude-opus-5-5` implements three disjoint slices; Codex reviews integration
and verifies desktop/mobile. No deployment or commit is implied by this decision.
See `brain/plans/2026-10-24-wall-planner-migration.md` for the execution contract
and final conformance audit.

## Production release, 2026-10-24

Wall planner is deployed on both canonical domains and passes live desktop and
320/390px viewport acceptance. Application source `7f51ea0`; PR #3. The pending
password-recovery rollout is excluded and retained locally. See
[release evidence](../handoffs/2026-10-24-wall-planner-production.md).
