# 01 — Adopt shared local infrastructure

**Status:** implemented — rollout verification pending

**Blocked by:** None — can start immediately.

Route dev, services, database, and environment selection through
`local-infra-kit` with the `afterservice` profile. Load `.env` plus exactly one
of `.env.local`, `.env.dev`, `.env.preview`, or `.env.production`; local Docker
startup must derive its connection from the selected URL and refuse an occupied
foreign port.
