import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { randomBytes, randomUUID } from "node:crypto";
import {
  digestQaAccessValue,
  exchangeQaTesterCredential,
  issueQaTesterCredential,
  listQaAccessProfiles,
  revalidateQaClientAuthorization,
  revokeQaClientAuthorization,
  revokeQaTesterGrant,
  selectQaAccessProfile,
  validateQaDerivedSession,
} from "../../packages/db/src/index";
import { localTestDb } from "../support/local-db";

const db = localTestDb();
const secret = randomBytes(48).toString("base64url");
let domain: string;
let clientId: string;
let grant: Awaited<ReturnType<typeof issueQaTesterCredential>>;
const workspaceIds: string[] = [];
const userIds: string[] = [];
const domainDigests: string[] = [];
const bucketDigests: string[] = [];

function requireItem<T>(items: T[]): T {
  const item = items[0];
  if (!item) throw new Error("Expected a seeded QA record");
  return item;
}

async function workspace(
  input: {
    domain?: string;
    normal?: boolean;
    blocked?: "paid" | "purging";
  } = {},
) {
  const qaDomain = input.domain ?? domain;
  const user = await db.user.create({
    data: {
      email: `${randomUUID()}@${qaDomain}`,
      name: "QA Integration Operator",
    },
  });
  userIds.push(user.id);
  const item = await db.workspace.create({
    data: {
      name: "QA Integration Workshop",
      slug: `qa-integration-${randomUUID()}`,
      dataClassification: input.normal ? "normal" : "qa",
      qaSourceDomain: input.normal ? null : qaDomain,
      qaPurgeStartedAt: input.blocked === "purging" ? new Date() : null,
    },
  });
  workspaceIds.push(item.id);
  const membership = await db.membership.create({
    data: { userId: user.id, workspaceId: item.id, role: "owner" },
  });
  if (input.blocked === "paid")
    await db.subscription.create({
      data: {
        workspaceId: item.id,
        providerSubId: randomUUID(),
        status: "active",
      },
    });
  return { user, item, membership };
}
const exchange = (credential = grant.credential, qaDomain = domain) =>
  exchangeQaTesterCredential(db, {
    secret,
    credential,
    qaDomain,
    clientId,
    clientPlatform: "web",
    contractVersion: 1,
  });
async function enter() {
  const auth = await exchange();
  const profiles = await listQaAccessProfiles(db, {
    secret,
    token: auth.token,
  });
  const session = await selectQaAccessProfile(db, {
    secret,
    token: auth.token,
    profileReference: requireItem(profiles).profileReference,
  });
  const saved = await db.session.findUniqueOrThrow({
    where: { token: session.token },
  });
  return { auth, session, saved };
}

beforeEach(async () => {
  domain = `qa-${randomUUID()}.test`;
  clientId = `web_${randomUUID()}`;
  domainDigests.push(
    digestQaAccessValue(secret, "audit-domain", domain).slice(0, 24),
  );
  bucketDigests.push(
    digestQaAccessValue(
      secret,
      "exchange-attempt-client",
      `${domain}|${clientId}`,
    ),
  );
  grant = await issueQaTesterCredential(db, {
    secret,
    qaDomain: domain,
    testerIdentity: "integration",
    expiresAt: new Date(Date.now() + 3600000),
  });
});
afterEach(async () => {
  await db.qaTesterGrant.deleteMany({ where: { id: grant.grant.id } });
  await db.qaAccessAuditEvent.deleteMany({
    where: { domainDigest: { in: domainDigests.splice(0) } },
  });
  await db.qaAccessAttemptBucket.deleteMany({
    where: { bucketDigest: { in: bucketDigests.splice(0) } },
  });
  for (const id of workspaceIds.splice(0))
    await db.workspace.delete({ where: { id } });
  for (const id of userIds.splice(0)) await db.user.delete({ where: { id } });
});
afterAll(() => db.$disconnect());

describe("QA access real-database lifecycle", () => {
  test("profile discovery excludes normal, other-domain, paid, and purging workspaces", async () => {
    const own = await workspace();
    await workspace({ normal: true });
    await workspace({ domain: `other-${domain}` });
    await workspace({ blocked: "paid" });
    await workspace({ blocked: "purging" });
    const auth = await exchange();
    const profiles = await listQaAccessProfiles(db, {
      secret,
      token: auth.token,
    });
    expect(profiles.map((p) => p.workspace.id)).toEqual([own.item.id]);
    expect(requireItem(profiles).profileReference).toStartWith("qap_");
    expect(auth.authorization.expiresAt.getTime()).toBeLessThanOrEqual(
      grant.grant.expiresAt.getTime(),
    );
  });
  test("concurrent profile selection consumes the reference once and scopes the session", async () => {
    const own = await workspace();
    const auth = await exchange();
    const profiles = await listQaAccessProfiles(db, {
      secret,
      token: auth.token,
    });
    const results = await Promise.allSettled(
      [1, 2].map(() =>
        selectQaAccessProfile(db, {
          secret,
          token: auth.token,
          profileReference: requireItem(profiles).profileReference,
        }),
      ),
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const sessions = await db.session.findMany({
      where: { userId: own.user.id },
    });
    expect(sessions).toHaveLength(1);
    expect(requireItem(sessions).qaWorkspaceId).toBe(own.item.id);
    expect(requireItem(sessions).qaMembershipId).toBe(own.membership.id);
    expect(requireItem(sessions).expiresAt.getTime()).toBeLessThanOrEqual(
      grant.grant.expiresAt.getTime(),
    );
  });
  test("a profile becoming paid after discovery cannot be selected", async () => {
    const own = await workspace();
    const auth = await exchange();
    const profiles = await listQaAccessProfiles(db, {
      secret,
      token: auth.token,
    });
    await db.subscription.create({
      data: {
        workspaceId: own.item.id,
        providerSubId: randomUUID(),
        status: "past_due",
      },
    });
    await expect(
      selectQaAccessProfile(db, {
        secret,
        token: auth.token,
        profileReference: requireItem(profiles).profileReference,
      }),
    ).rejects.toMatchObject({ category: "authorization_required" });
    expect(await db.session.count({ where: { userId: own.user.id } })).toBe(0);
  });
  test("membership removal invalidates and deletes the derived session", async () => {
    const own = await workspace();
    const { saved } = await enter();
    expect((await validateQaDerivedSession(db, saved.id)).active).toBe(true);
    await db.membership.delete({ where: { id: own.membership.id } });
    expect((await validateQaDerivedSession(db, saved.id)).active).toBe(false);
    expect(await db.session.findUnique({ where: { id: saved.id } })).toBeNull();
  });
  test("client revocation and grant revocation both delete derived sessions", async () => {
    await workspace();
    const first = await enter();
    await revokeQaClientAuthorization(db, { secret, token: first.auth.token });
    expect(
      await db.session.findUnique({ where: { id: first.saved.id } }),
    ).toBeNull();
    await expect(
      revalidateQaClientAuthorization(db, { secret, token: first.auth.token }),
    ).rejects.toMatchObject({ category: "authorization_required" });
    const second = await enter();
    await revokeQaTesterGrant(db, { secret, grantId: grant.grant.id });
    expect(
      await db.session.findUnique({ where: { id: second.saved.id } }),
    ).toBeNull();
    await expect(exchange()).rejects.toMatchObject({
      category: "authorization_required",
    });
  });
  test("ordinary API context stays bound to the QA workspace and strips platform admin", async () => {
    const own = await workspace();
    await db.user.update({
      where: { id: own.user.id },
      data: { platformRole: "platform_admin" },
    });
    const normal = await db.workspace.create({
      data: {
        name: "Earlier Normal Workspace",
        slug: `normal-${randomUUID()}`,
      },
    });
    workspaceIds.push(normal.id);
    await db.membership.create({
      data: {
        userId: own.user.id,
        workspaceId: normal.id,
        role: "owner",
        createdAt: new Date("2000-01-01"),
      },
    });
    const { session, saved } = await enter();
    const { createBetterAuthSessionCookieHeaders } = await import(
      "../../packages/auth/src/qa-session-cookie"
    );
    const { createContext } = await import("../../apps/api/src/context");
    const cookie = createBetterAuthSessionCookieHeaders(session)
      .map((value) => value.split(";")[0])
      .join("; ");
    const request = new Request("http://localhost:4101/api/trpc", {
      headers: { cookie },
    });
    const context = await createContext(request);
    expect(context.workspace?.id).toBe(own.item.id);
    expect(context.platformRole).toBe("user");
    await db.qaClientAuthorization.update({
      where: { id: saved.qaAuthorizationId ?? "" },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    expect((await createContext(request)).workspace).toBeNull();
    expect(await db.session.findUnique({ where: { id: saved.id } })).toBeNull();
  });
  test("expired profile references cannot create sessions", async () => {
    const own = await workspace();
    const auth = await exchange();
    const profiles = await listQaAccessProfiles(db, {
      secret,
      token: auth.token,
    });
    await db.qaAccessProfileSelection.updateMany({
      where: { workspaceId: own.item.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    await expect(
      selectQaAccessProfile(db, {
        secret,
        token: auth.token,
        profileReference: requireItem(profiles).profileReference,
      }),
    ).rejects.toMatchObject({ category: "authorization_required" });
    expect(await db.session.count({ where: { userId: own.user.id } })).toBe(0);
  });
  test("expired authorization rejects profile access", async () => {
    const auth = await exchange();
    await db.qaClientAuthorization.updateMany({
      where: { grantId: grant.grant.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    await expect(
      listQaAccessProfiles(db, { secret, token: auth.token }),
    ).rejects.toMatchObject({ category: "authorization_required" });
  });
  test("five bad credentials lock the client even when the next credential is valid", async () => {
    for (let n = 0; n < 5; n++)
      await expect(exchange(`invalid-${randomUUID()}`)).rejects.toMatchObject({
        category: "authorization_required",
      });
    await expect(exchange()).rejects.toMatchObject({ category: "locked" });
    expect(
      await db.qaClientAuthorization.count({
        where: { grantId: grant.grant.id },
      }),
    ).toBe(0);
  });
});
