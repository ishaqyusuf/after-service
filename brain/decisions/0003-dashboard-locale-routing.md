# 0003. Dashboard Locale Routing Uses Midday Pattern

**Date**: 2026-06-11

## Context
afterservice needs a language/i18n foundation that follows the Midday architecture without coupling language locale to pricing currency. Midday uses a dashboard app tree rooted at `app/[locale]`, `next-international` middleware with rewrite URL mapping, and app-local `locales` client/server helpers.

The public website should not use this locale route pattern yet. It remains a non-locale marketing surface, while regional pricing display is handled separately by the pricing localization layer.

## Decision
Use the Midday dashboard locale architecture in `apps/dashboard`:

- Dashboard pages and layouts live under `apps/dashboard/src/app/[locale]`.
- `apps/dashboard/src/proxy.ts` uses `createI18nMiddleware` from `next-international/middleware` with `locales: ["en"]`, `defaultLocale: "en"`, and `urlMappingStrategy: "rewrite"`.
- `apps/dashboard/src/app/[locale]/layout.tsx` receives `params.locale`, sets `<html lang={locale}>`, and wraps children in `Providers`.
- `apps/dashboard/src/app/[locale]/providers.tsx` wraps the app with `TRPCReactProvider`, `I18nProviderClient`, and `ThemeProvider`, matching the Midday provider layering.
- `apps/dashboard/src/locales/client.ts`, `server.ts`, and `en.ts` provide the i18n entrypoints.

## Consequences
- Dashboard routes can remain user-facing as `/`, `/customers`, `/billing`, `/sign-in`, etc. while Next renders the internal `/en/...` route tree.
- Future language support can add locale dictionaries and middleware locales without restructuring the dashboard app.
- Website language routing is intentionally not introduced yet.
- Pricing currency/region selection remains independent from the dashboard route locale; the pricing layer may use request locale headers only as a fallback signal after geolocation headers.
- Regional pricing data lives in `@afterservice/plans`, matching Midday's package-boundary pattern for plan/pricing business rules.
