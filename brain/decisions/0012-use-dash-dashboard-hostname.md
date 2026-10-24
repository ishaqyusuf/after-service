# Use dash.afterservice.app for the dashboard

Date: 2026-10-18
Status: Accepted

The dashboard's canonical production hostname is `dash.afterservice.app`,
replacing `dashboard.afterservice.app` at the user's request. Shared URL
helpers, browser OAuth, trusted-origin configuration, smoke checks, and
current documentation use the new hostname. Local Portless names stay unchanged.

Rollout requires attaching the new hostname to the dashboard hosting project,
pointing DNS at that project, updating deployed dashboard/auth/trusted-origin
variables across all apps, registering the new Google OAuth origin and callback
(`https://dash.afterservice.app/api/auth/callback/google`), and redeploying.
Other external origin allowlists, including Logly, must include the new origin.
Host-scoped sessions require users to sign in on the new hostname.

This source change does not confirm the external rollout. Historical incident
records retain the hostname used when those events occurred.
