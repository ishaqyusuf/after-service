# Country tracking production release — 2026-10-24

Status: Deployed and verified.

## Scope and isolation

Reconstructed each site's exact current Vercel production source, checked file
SHA-1s, and overlaid only the reviewed country changes. This preserved live
fixes that were not committed in the shared checkout and excluded unrelated
unfinished local work. Afterservice changed six files per surface: SDK version,
root patch declaration, lockfile, route, route tests, and tracked Next patch.
Logly changed eight country SDK/display/test files plus release-only artifact
ignore rules. Its existing build command was preserved; no migration ran.

## Production deployments

| Surface | Previous production | New production |
| --- | --- | --- |
| Website | `dpl_HWzgrz3otcCYuXrxCQV2ZvCsGXeR` | `dpl_DELDv8FpopNs797knFSMkkArZciH` |
| Dashboard | `dpl_EZAeCXZXNQnLqPXGSvf3aEdirV5X` | `dpl_ArgCRKAwFDhVpejQ9MBHkXwBskQF` |
| Logly | `dpl_AJBtoENjZbPnxkRBoxvDuEadFhkZ` | `dpl_CRYYWr8cjfmuZY6DnugWSYdYHBdk` |

All builds reached Ready before promotion. Each old alias was rechecked before
promotion to avoid overwriting a concurrent deployment. Final alias reads
confirmed all three new deployment IDs.

- [Website](https://www.afterservice.app/) — HTTP 200.
- [Dashboard sign-in](https://dash.afterservice.app/sign-in) — HTTP 200.
- [Logly collector health](https://logly-chi.vercel.app/health) — HTTP 200.

## Verification

The isolated Afterservice release passed 12 analytics tests and analytics
package typing on each surface. The isolated Logly production baseline passed
78 tests, full workspace typing and a production dashboard build. The broader
working checkout's earlier 96-test result includes its separate unfinished
features; those features were not included in this release. Pre-release diff
review found no issues. Remote builds also passed.

Fresh visits were made in a newly opened private Chrome window, with normal
request headers and no fabricated country, event injection, privacy-setting
change, or clearing of the user's existing browser data. Both appeared in the
Afterservice project in authenticated production Logly:

| Surface | Event ID | Route | Occurred (Africa/Lagos) | Country |
| --- | --- | --- | --- | --- |
| Website | `41de2d2e-d92a-4bc7-91a9-a76d39cec96e` | `/` | 2026-10-24 08:17:58 | Nigeria (NG) |
| Dashboard | `b132a834-8cb3-451e-bfcb-c3323fe9ac66` | `/sign-in` | 2026-10-24 08:18:42 | Nigeria (NG) |

Both rows and event Context details display the Nigerian flag, country name,
and code. They are new-browser `site_visit` events, with `visit_kind: new`.
Earlier rows remain Unknown. The 7-day visit count rose from 72 to 74 during
these two checks. Logly had no browser console errors. The private window
and temporary in-app visit tab were closed; the authenticated result tab was
kept available for review. No npm package, environment variable, analytics key,
or schema was changed during deployment.

[Open the verified dashboard visit](https://logly-chi.vercel.app/events?organization=personal&project=afterservice&names=site_visit&eventId=b132a834-8cb3-451e-bfcb-c3323fe9ac66&eventType=details).

Screenshots in this chat's visualization directory:
- `logly-country-production.png`: fresh website event detail.
- `logly-country-production-visits.png`: both fresh visits with NG and historical
  rows remaining Unknown.

Release source snapshots and per-file hashes are retained locally under
`/private/tmp/country-release-{website,dashboard,logly}` and
`/private/tmp/country-release-record.json`. No unrelated working-tree code
was committed, reverted, or deployed.

## Country-only source branch

The country integration is maintained on `codex/visit-country-tracking`, based
on GitHub main. Its commit contains only country forwarding, the Next adapter
patch, scoped verification, and country Brain documentation. Separate existing
local commits and unfinished work are excluded. The shared source checkout
and its index remain unchanged; the production source snapshots above retain
the already deployed baseline fixes independently.
