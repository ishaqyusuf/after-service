# 06 — Enforce provider and irreversible-effect safety

**Status:** implemented — provider canary pending

**Blocked by:** 03 — Authorize a QA Domain with a tester credential.

Allow routed QA email while blocking unsupported SMS, WhatsApp, paid checkout,
subscriptions, destructive maintenance, and comparable effects for QA
workspaces before provider invocation. Quick Fill never submits or mutates.
