# Auth Email Analytics

Updated: 2026-10-19
Status: Deployed; actual production browser interaction and Logly storage verified

Both email submit buttons emit `continue_with_email_clicked` through the existing
optional Logly browser adapter. Properties are `channel: login`, `method: email`,
and `location: dashboard_sign_in` or `dashboard_sign_up`.

The event fires when the submit button is activated, including a browser's
keyboard activation. It measures intent before client validation; it does not
mean credentials were valid or an account was created. Signup continues to
emit `sign_up_started` after validation and `sign_up_completed` after success.
The “Or continue with email” divider is text, not a separate clickable control.

No entered email, password, name, redirect path, or other user/customer data is
included. The existing enable switch and GPC/DNT suppression still apply. The 2026-10-19 production browser pass activated both submit buttons. A scoped
read of the Afterservice Logly project after the test start found two events at
each location. Evidence contains event counts and locations only, without entered
credentials or customer details. Synthetic ingestion was separately verified on
2026-10-18.
