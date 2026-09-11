import { getDbClient, revokeQaTesterGrant } from "../src";

const grantId = process.argv[2]?.trim();
const secret = process.env.QA_ACCELERATOR_SECRET?.trim();

if (!grantId) {
  throw new Error("Usage: bun run qa:credential:revoke -- <grant-id>");
}
if (!secret || secret.length < 32) {
  throw new Error("QA_ACCELERATOR_SECRET must contain at least 32 characters.");
}

console.log(
  JSON.stringify(
    await revokeQaTesterGrant(getDbClient(), { grantId, secret }),
    null,
    2,
  ),
);
