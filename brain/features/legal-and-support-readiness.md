# Legal and support readiness

Updated: 2026-10-24
Status: published and production browser verification complete

## Confirmed facts

The founder confirmed on 2026-10-24 that the exact registered operator is
**Zeroes and One Hi-Tech**, registered in **Nigeria**, trading as **afterservice**.
The founder also confirmed `hello@afterservice.app` works and is monitored.
The confirmation is operational ownership evidence, not an independent registry
or inbox-deliverability audit. No additional email was sent for this step.

## Public behavior

`/privacy` and `/terms` replace the scaffold placeholders. Both identify the
operator/country, carry an effective date, and link to each other and the
monitored support address. Their shared server-rendered layout uses semantic
headings, readable line lengths and visible inline links with keyboard focus.
The existing footer already links both pages and the support email.

The privacy page distinguishes account/service information from business-owned
customer records; covers purposes and lawful bases, actual infrastructure and
optional AI providers, requested communication, technical storage, retention
criteria, access and privacy requests, and the NDPC complaint route. It avoids
invented fixed retention/deletion SLAs, local-only hosting, certifications or
blanket compliance claims. Optional features are described conditionally.

Terms cover authority over an account/workspace, lawful customer contact,
content ownership, acceptable use, Free/Business billing and cancellation,
provider dependence, closure, Nigeria governing law and mandatory rights.
No arbitrary liability cap, universal no-refund rule or invented business
address/registration number was added. Polar payment acceptance remains a
separate provider/account requirement; these pages do not resolve that review.

## Source checks

- Inspected account/workspace and notification behavior, current pricing and
  assistant rollout handoffs, and service integration configuration.
- Browser analytics uses Logly core 0.2.0 `privacySignalsAllowTracking`, which
  checks GPC and Do Not Track; browser storage persists a visitor identifier.
  No consent banner or blanket analytics consent promise is claimed.
- Primary Nigerian source read in the in-app browser on 2026-10-24:
  [NDPC rights overview](https://ndpc.gov.ng/) and
  [NDPC privacy policy](https://ndpc.gov.ng/our-data-privacy-policy/), specifically
  principles, rights and international service-provider transfers. These inform
  notice coverage; NDPC's own purposes/retention practices were not copied.
- No independent legal-compliance certification, processor-contract audit or
  cross-border transfer adequacy determination is claimed by this work.

## Release scope

Shared checkout contains unrelated unfinished redesign work. The release uses
668 source files verified by SHA-1 against current production deployment
`dpl_Hqxm7wVQTVkndg75PE17imcpagvp`. Only the two legal pages and shared legal-page
component are overlaid. Pricing, signup, analytics and all other deployed
source remain unchanged. Source receipt: `outputs/legal-readiness-20261024/`.

Website typecheck passes in both the shared checkout and isolated source.
Scoped Biome and diff checks pass. Production build succeeded. In-app desktop
browser verified both public pages, operator/country/effective date, reciprocal
navigation, canonical metadata, mailto support targets and retained NGN Business
pricing. Both pages have zero captured browser errors and no horizontal overflow
at the observed 1280px viewport. No mobile viewport/device acceptance is claimed.

Promoted `dpl_DUhi4yXDmJjw1xWsy1C1zRUcmbjU` after confirming the live baseline
was unchanged. Canonical production deployment re-read confirms the new release.
Public URLs: https://www.afterservice.app/privacy and
https://www.afterservice.app/terms. Previous deployment is retained for rollback.
Screenshots: `.gstack/qa-reports/screenshots/2026-10-24/legal-privacy-production.png`
and `legal-terms-production.png`. Release receipt records the verified source
boundary and checks without credentials.
No database, API, permission or schema changes are required for these pages.
