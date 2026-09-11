# 02 — Attach QA tooling to authorized non-production environments

**Status:** implemented — artifact verification pending

**Blocked by:** 01 — Adopt shared local infrastructure.

Expose one versioned server-owned web QA capability only for correctly
configured local, development, and preview environments. Production,
misconfiguration, client-controlled flags, and version skew fail closed while
`EMAIL_QA_DOMAIN_ROUTES` remains independent.
