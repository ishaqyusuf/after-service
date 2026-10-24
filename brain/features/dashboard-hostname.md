# Dashboard hostname

Updated: 2026-10-19
Status: Deployed; Google, password, and production browser acceptance verified

- Production dashboard: `https://dash.afterservice.app`.
- Browser OAuth callback: `https://dash.afterservice.app/api/auth/callback/google`.
- `buildDashboardUrl` and `buildAuthUrl` resolve to this hostname in production
  unless an explicit environment override is provided.
- `NEXT_PUBLIC_DASHBOARD_URL`, `BETTER_AUTH_URL`, and dashboard entries in
  trusted-origin variables must use the new origin in deployed environments.
- Standalone API remains `https://api.afterservice.app`; local development
  remains `app-afterservice.localhost` or `localhost:4101`.
- Hosting, DNS, OAuth provider, analytics allowlists, and deployment work follow
  `brain/decisions/0012-use-dash-dashboard-hostname.md`.

Verification on 2026-10-18: attached the hostname to the existing dashboard
Vercel project, resolving Cloudflare HTTP 525. HTTPS now returns 200. Updated
production URL/trusted-origin settings across API/dashboard/website and deployed
the verified fixes. Marketing login/signup redirects use the new hostname.
Real production signup, onboarding, protected pages, CRUD, phone contact logs,
reply/closure, settings, billing reads, sign-out, and sign-in passed over HTTP.
The standalone API also validated the synthetic dashboard session.

Provider acceptance passed on 2026-10-19 after Chrome/app restart restored
browser access. The AfterService Web OAuth client in project `after-service`
now includes the exact dashboard JavaScript origin and callback above. Existing
origins/callbacks were preserved. Saving was confirmed, and Google login returned
to an authenticated production dashboard. The real workspace was only inspected;
operator mutations used a separate generated verification workspace.

Desktop and mobile Chrome exercised signup/onboarding, customer/job/follow-up
operations, templates, settings, Free Beta billing, password sessions, and
canonical marketing redirects. See
`brain/handoffs/2026-10-19-production-browser-acceptance.md` for evidence and limits.
