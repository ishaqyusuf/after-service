# QA email and data cleanup

- Notification and password-reset mail use `console`/`live` ordinary delivery
  with independent per-recipient `EMAIL_QA_DOMAIN_ROUTES`.
- Mapped `.test` recipients always use the provider; unmapped `.test` recipients
  fail closed; synthetic identities remain visible in the subject, banner, and
  provider header.
- `Workspace` is the explicit QA root. Creation classifies from the owner email,
  legacy candidates require platform-admin adoption, and identity lanes cannot
  mix.
- afterservice adds a global `platform_admin` user capability and
  `/{locale}/platform/qa-maintenance` for discovery, adoption, preview,
  blockers, confirmation, and progress.
- Active subscriptions block cleanup. Trigger revokes sessions, deletes
  workspace aggregates and orphan users, supports partial retry, and retains
  only counts-only `QaPurgeRun` receipts.
