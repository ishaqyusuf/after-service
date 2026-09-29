# ADR 0010: Use The care continues marketing system

Date: 2026-09-29
Status: Accepted

## Context

The website's former landing page and connected content pages used different page shells and a more generic visual language. The selected v2 workshop direction 01, “The care continues,” explains the manual-first product through a travelling customer record and a three-step service narrative.

## Decision

Use direction 01 as the website's production design system. Keep a single shared marketing header and footer across public routes. Build the homepage story as semantic React content with native scrolling, small stateful controls, and CSS transitions. Self-host the selected reference fonts so rendering and production builds do not depend on Google Fonts availability. Preserve the existing pricing, SEO, analytics, PWA, and cross-app auth boundaries.

## Consequences

The website has one recognizable light teal and green language across its route families. The demonstration is explicitly illustrative and makes no automatic-send claim. Legal copy and dashboard UI stay outside the redesign's substantive scope.
