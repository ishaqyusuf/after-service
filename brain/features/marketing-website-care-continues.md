# Marketing website: The care continues

Date: 2026-09-29

## Status

Implemented for the public website.

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
