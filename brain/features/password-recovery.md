# Password recovery

Updated: 2026-10-24
Status: implemented locally; human reset succeeded. Native autofill investigation
stopped at the user's request after they confirmed it works in Chrome.
New-password browser sign-in and production rollout remain pending.

## Behavior

- Anonymous visitors can open exactly `/forgot-password` and `/reset-password`,
  including supported locale variants. Similarly named protected routes remain
  behind sign-in.
- A revoked/stale session cookie cannot bounce reset completion away from
  sign-in. HTTPS Portless origins are explicitly trusted for local email
  callbacks, alongside the existing production and HTTP development origins.
- The email form uses Better Auth's typed `requestPasswordReset` client and an
  absolute callback on the current dashboard origin. The installed endpoint is
  `/api/auth/request-password-reset`; `/forget-password` is obsolete.
- The request response is deliberately generic for existing and absent accounts.
  Better Auth also keeps that response generic when its email callback fails;
  a successful request is not proof of email delivery.
- The email link passes through Better Auth's callback and supplies the one-use
  token to `/reset-password`. The form submits that token with the new password.
  Missing/invalid/expired links offer a fresh request instead of credential fields.
- Passwords must match and contain 8–128 characters. Successful reset clears
  the token by navigating fully to `/sign-in?password_reset=success`, which
  displays a persistent confirmation. Existing sessions are revoked. Fields
  are not reset before navigation, so password managers can observe submission.
- Both reset fields have independent, keyboard-accessible eye buttons to show
  or hide their values. They start masked; visibility buttons never submit the
  form and are disabled during submission.
- The reset page disables indexing and referrers. Reset tokens are never logged
  by the email sender. Logly records pathname only, not the token query.
- Reset forms use POST even before JavaScript hydrates, explicit autocomplete,
  and `new-password` on both password fields. Native save/update prompts and
  generation/fill are browser-managed; no save or generation support is assumed
  from these hints alone.

## Delivery

Password recovery calls Resend directly; it does not depend on Trigger credits.
Existing console/live and exact QA-domain routing rules apply. Provider requests
have a 15-second timeout, escape email HTML and fail with sanitized status-only
errors. Better Auth logs those errors while preserving the generic public reply.

Local acceptance found `afterservice.qa.test` configured to the placeholder
`qa-inbox@example.com`; Resend rejected delivery (422). The user approved a
temporary, in-memory route to `ishaqyusuf024@gmail.com` for the disposable local
QA account. No secret file was changed. Do not infer production delivery from
this local configuration or a 200 recovery response.

## Verification

Run the focused, self-contained regression command with
`bun run test:password-recovery` (requires the local PostgreSQL profile).

- Proxy regression went red on the original sign-in redirect, then passed.
- Reset-field visibility buttons were verified in a separate in-app tab with
  empty inputs: each toggles independently between password/text, keyboard Enter
  toggles it back, and neither submits the form. Scoped dashboard typecheck and
  Biome pass. The human's pending reset fields were not read or changed.
- Email tests cover QA routing, HTML escaping, provider rejection, and absence of
  token logging in console mode.
- Real local PostgreSQL/Better Auth HTTP integration covers email-link callback,
  missing token, short password, successful reset, old-password rejection,
  new-password sign-in, session revocation, reuse/expiry rejection, generic absent
  account response, and untrusted callback rejection. Provider traffic is stubbed.
- Full monorepo and harness typechecks, 167 unit tests, and the dashboard
  optimized build pass. The complete integration suite passes 48 tests and 237
  assertions. Browser acceptance uses only the in-app browser and
  requires the human to enter/confirm/submit a new password per tool policy.
- In-app desktop checks verify sign-in → forgot-password, the generic request
  confirmation, the received QA email in Gmail, its exact local HTTPS callback,
  and the visible new-password form. Invalid callback links show the fresh-link
  action. The human completed reset; the local credential timestamp changed and
  the old password is now rejected. Clearing the token through History had
  remounted an invalid-link view; the full sign-in navigation fixes that
  transition. Browser acceptance of this corrected transition is pending.
  New-password browser sign-in is not yet claimed. A requested viewport override did not
  change the observed 1280px width, so mobile acceptance is not claimed.
- Browser fixture identity is stored privately under the ignored
  `.gstack/qa-reports/password-recovery-identity.json`; remove it and its exact
  local records after acceptance. Never publish its password or reset token.

No database schema migration is required.

## Native suggested-password investigation closed by user

The human confirmed suggestions do not fill the in-app browser's fields but do
work in Chrome. During the failed in-app retry, neither field held a value and
no new input events reached the page. Direct input-event handling did not help.
This points to a browser-specific integration issue; its native internals were
not inspected and no definitive browser root cause is claimed. The user asked
to skip further fixes. All temporary probes and the unproven input-event
workaround were removed. Standard autocomplete hints, visibility controls, POST
submission and the corrected success navigation remain. No password-manager
settings or stored credentials were changed.
