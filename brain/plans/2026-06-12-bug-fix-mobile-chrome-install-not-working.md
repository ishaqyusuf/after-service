# Plan: Fix Mobile Chrome Install Not Working

## Type
Bug Fix

## Status
In Progress

## Created Date
2026-06-12

## Last Updated
2026-06-12

## Goal Or Problem
The mobile Chrome install flow for afterservice is not working. The issue is specifically with the website PWA install path, not a general mobile Chrome page-load failure.

## Current Context
- afterservice is a Bun/Turbo monorepo with Next.js App Router apps for `apps/website` and `apps/dashboard`.
- Project domains are `afterservice.app` for the marketing website and `dashboard.afterservice.app` for the dashboard.
- Website PWA install code lives in `apps/website`.
- The website has `apps/website/src/app/manifest.ts`, `apps/website/public/sw.js`, and `apps/website/src/components/landing/mobile-install-top-sheet.tsx`.
- Chrome installability relies on a valid linked manifest and browser support for install promotion. The custom `beforeinstallprompt` UI only appears after Chrome decides the app is installable.
- The project rule for production page-load failures still applies if the investigation turns into a page-load failure:
  - Marketing pages: `bun run terminal prod:website`
- Website local port is `4100`; dashboard local port is `4101`.
- Styling is Tailwind CSS in the app packages.

## Proposed Approach
Harden the website PWA install path by making the service worker satisfy Chrome install/offline expectations, making the manifest metadata explicit, and ensuring the mobile install sheet does not fail silently when the browser prompt is unavailable, already consumed, or unsupported on the current mobile Chrome platform.

## Implementation Steps
- Update `apps/website/public/sw.js` so the service worker caches the app shell/start URL and can return a 200 response for navigation while offline.
- Update `apps/website/src/app/manifest.ts` with explicit app id, launch behavior, related-app preference, and icon purpose metadata that supports Chrome install prompts.
- Update `apps/website/src/components/landing/mobile-install-top-sheet.tsx` so install prompt failures are handled visibly and telemetry captures unavailable/failed prompt states.
- Verify the website typecheck and production build.
- Verify manifest and service worker responses from the built website.
- Re-test mobile Chrome install behavior on Android Chrome or Chrome DevTools mobile emulation.

## Affected Files Or Areas
- `apps/website`
- `apps/website/src/app/manifest.ts`
- `apps/website/public/sw.js`
- `apps/website/src/components/landing/mobile-install-top-sheet.tsx`
- `brain/tasks/in-progress.md`

## Acceptance Criteria
- Mobile Chrome can install the afterservice website when installability criteria are met.
- The custom install sheet only calls the browser install prompt when a valid deferred prompt exists.
- Prompt failures or unsupported prompt states do not silently break the UI.
- The service worker controls the website and can serve the start URL/offline fallback for navigation.
- Desktop website behavior remains unchanged.

## Test Plan
- Run `bun --filter @afterservice/website typecheck`.
- Run `bun run --filter @afterservice/website build`.
- Start the production website locally and verify `/`, `/manifest.webmanifest`, icons, and `/sw.js` respond successfully.
- In mobile Chrome or Chrome DevTools, verify the app meets installability criteria and the install action opens the browser install dialog.
- Verify no visible regression on the mobile landing page.

## Risks / Edge Cases
- The issue may only reproduce on a physical Android Chrome device and not in browser emulation.
- Chrome on iOS does not support the same PWA install prompt path as Android Chrome.
- Chrome will not fire `beforeinstallprompt` if the app is already installed, if installability criteria fail, or if the device/browser disallows install prompts.
- Production-only environment variables or asset URLs may differ from local development.
- Local install testing requires HTTPS, `localhost`, or `127.0.0.1`.
- TODO: Exact device, Chrome version, and production install failure symptom.

## Open Questions
- TODO: Is the failing device Android Chrome or iOS Chrome?
- TODO: Does the install sheet fail to appear, or does tapping `Install now` fail to open the browser dialog?
- TODO: Is the failure only on `afterservice.app` production or also on local `localhost:4100`?

## Linked Task
- Task Title: Fix Mobile Chrome Install Not Working
- Task File: brain/tasks/in-progress.md
