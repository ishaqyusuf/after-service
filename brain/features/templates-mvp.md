# Feature: Follow-Up Templates MVP

## Status
Implemented for MVP on 2026-05-30.

## Scope
- List, create, update, archive, and set-default templates.
- Starter templates are seeded on onboarding.
- Template preview resolves merge tags against sample customer/job/workspace data.
- Templates can be selected when creating follow-ups from jobs and follow-up forms.

## Architecture
- API owner: `apps/api/src/routers/_app.ts` `templates` router.
- UI owner: `apps/dashboard/src/app/templates/page.tsx`.

## Merge Tags
- `{{customer_name}}`
- `{{business_name}}`
- `{{service_name}}`
- `{{completion_date}}`

## Limits
Template creation enforces current plan limits.

