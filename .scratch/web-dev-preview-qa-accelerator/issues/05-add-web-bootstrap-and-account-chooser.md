# 05 — Add the web QA bootstrap and account chooser

**Status:** implemented — browser acceptance pending

**Blocked by:** 04 — Enter a workspace-scoped QA access profile.

Add an accessible responsive QA setup and searchable workspace-profile chooser
to non-production sign-in. Authorization stays in a secure HttpOnly cookie;
refresh/direct navigation and revocation recover safely, while normal email and
Google sign-in remain unchanged.
