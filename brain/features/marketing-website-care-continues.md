# Marketing website: The care continues

Date: 2026-09-29

## Status

Historical design implemented on 2026-09-29; superseded locally by the owner-selected Wall planner system on 2026-10-24 (ADR 0026).

## Behavior

- The homepage presents a completed job, a planned check-in, and a recorded reply as one illustrative customer journey. The three-chapter story follows native scrolling and has explicit chapter controls.
- The opening demonstration plays once, with pause and replay controls. Reduced-motion preferences show the final state without automatic playback.
- Business examples for repair shops, installers, local contractors, and service teams illustrate manual follow-up.
- The free beta is presented as a manual-first workflow: staff use their usual channels and record contact and replies. Provider messaging and automation remain planned capabilities.
- Signup actions use the website `/signup` redirect to the dashboard sign-up flow. Pricing keeps the existing localized plan resolution and planned-plan analytics.
- Shared navigation, typography, palette, spacing, and footer apply to the homepage, pricing, feature, solution, guide, and legal route families. The `/customers` redirect and auth redirects retain their existing behavior.
- Existing SEO metadata, structured data, sitemap, analytics providers, consent handling, and PWA prompts remain wired through their established components.
- The shared 1200×630 Open Graph and Twitter image carries the care-continues headline and a three-step work, follow-through, and relationship journey. Its alt text describes the same scene, and all public routes reference the generated `/opengraph-image` asset.

## Design decision

See `brain/decisions/0010-use-care-continues-marketing-system.md`.

## Wall planner replacement — 2026-10-24

The selected direction replaces the scrolling/autoplay chapter presentation with
an explicit keyboard-operable job/check-in/reply record, a split hero, ruled story,
five-stage chart and teal closing band. The story and domain intent remain.
Shared public route layouts, Free/Business fixed country pricing and handoff,
analytics/SEO/consent and PWA remain wired. Manual sending copy now accurately
separates enabled workspace email delivery from planned connected SMS/WhatsApp.
The PWA cache update prevents stale local development chunks.

See `complete-ui-redesign-workshop.md` and the Wall planner migration contract for
implementation details, tests and limits. The local redesign is not deployed.

## Production release, 2026-10-24

Wall planner is deployed on both canonical domains and passes live desktop and
320/390px viewport acceptance. Application source `7f51ea0`; PR #3. The pending
password-recovery rollout is excluded and retained locally. See
[release evidence](../handoffs/2026-10-24-wall-planner-production.md).
