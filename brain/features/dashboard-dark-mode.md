# Feature: Dashboard Dark Mode

## Status
Implemented on 2026-06-09.

## Scope
- Dashboard supports light, dark, and system theme preferences.
- Theme class is applied through `next-themes`, matching the Midday pattern.
- Theme selector is available from the dashboard user menu.

## Architecture
- Provider owner: `apps/dashboard/src/components/theme-provider.tsx`.
- Toggle owner: `apps/dashboard/src/components/theme-switch.tsx`.
- Mount point: `apps/dashboard/src/app/layout.tsx`.
- Menu integration: `apps/dashboard/src/components/user-menu.tsx`.
- Design tokens: `packages/ui/src/globals.css` already defines `:root` and `.dark` variables.

## Rule
Use class-based dark mode so all shared Tailwind color tokens continue to resolve through the existing `@afterservice/ui` CSS variables.
