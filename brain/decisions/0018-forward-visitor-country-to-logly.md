# 0018. Forward visitor country to Logly

Accepted 2026-10-24 by explicit user request.

Extend the initial analytics scope with approximate country codes. Resolve
country at Afterservice's server edge and forward it to Logly with the
project-scoped client-ingest credential. Prefer Cloudflare visitor geography
behind its proxy; otherwise use Vercel. Keep missing country unknown.

Reuse Logly's existing schema and Insights geography report. Expose country in
its event table/details as well. Never infer historical location, transmit IPs,
or use geography as identity/authorization. This supersedes the original
country-exclusion wording in Afterservice's observability scope.

Install published Next adapter 0.2.1 with a tracked Bun patch for the new
opt-in Cloudflare policy; apply the same option in Logly SDK source. This
keeps production dependency installation reproducible without publishing the
SDK's unrelated in-progress 0.3.0 changes.
