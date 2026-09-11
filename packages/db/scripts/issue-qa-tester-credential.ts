import { getDbClient, issueQaTesterCredential } from "../src";

const [qaDomainInput, testerIdentityInput, lifetimeHoursInput = "24"] =
  process.argv.slice(2);
const qaDomain = qaDomainInput
  ?.trim()
  .toLowerCase()
  .replace(/^\.+|\.+$/g, "");
const testerIdentity = testerIdentityInput?.trim();
const lifetimeHours = Number(lifetimeHoursInput);
const secret = process.env.QA_ACCELERATOR_SECRET?.trim();
const configuredRoutes = process.env.EMAIL_QA_DOMAIN_ROUTES?.trim();

if (!qaDomain || !testerIdentity) {
  throw new Error(
    "Usage: bun run qa:credential:issue -- <qa-domain> <tester-identity> [hours]",
  );
}
if (
  !Number.isFinite(lifetimeHours) ||
  lifetimeHours <= 0 ||
  lifetimeHours > 168
) {
  throw new Error("Credential lifetime must be between 1 and 168 hours.");
}
if (!secret || secret.length < 32) {
  throw new Error("QA_ACCELERATOR_SECRET must contain at least 32 characters.");
}
const routes = configuredRoutes
  ? (JSON.parse(configuredRoutes) as Record<string, string>)
  : {};
const isConfigured = Object.keys(routes).some(
  (domain) =>
    domain
      .trim()
      .toLowerCase()
      .replace(/^\.+|\.+$/g, "") === qaDomain,
);
if (!qaDomain.endsWith(".test") || !isConfigured) {
  throw new Error("The QA domain must exactly match EMAIL_QA_DOMAIN_ROUTES.");
}

const result = await issueQaTesterCredential(getDbClient(), {
  expiresAt: new Date(Date.now() + lifetimeHours * 60 * 60 * 1000),
  qaDomain,
  secret,
  testerIdentity,
});

console.log(
  JSON.stringify(
    {
      credential: result.credential,
      expiresAt: result.grant.expiresAt,
      grantId: result.grant.id,
      qaDomain: result.grant.qaDomain,
      testerIdentity: result.grant.testerIdentity,
    },
    null,
    2,
  ),
);
