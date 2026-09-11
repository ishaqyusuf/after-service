import { describe, expect, test } from "bun:test";
import type { PrismaClient } from "../../generated/prisma/client";
import {
  createQaAuthorizationToken,
  createQaProfileReference,
  createQaSessionToken,
  createQaTesterCredentialValue,
  digestQaAccessValue,
  QaAccessError,
  revalidateQaClientAuthorization,
  revokeQaClientAuthorization,
  selectQaAccessProfile,
} from "./qa-access";

const secret = "qa-access-test-secret-with-more-than-32-characters";

describe("QA access token primitives", () => {
  test("creates purpose-scoped, non-plaintext digests", () => {
    const credential = "afterservice_qa_example";
    const first = digestQaAccessValue(secret, "tester-credential", credential);
    const again = digestQaAccessValue(secret, "tester-credential", credential);
    const authorization = digestQaAccessValue(
      secret,
      "client-authorization",
      credential,
    );

    expect(first).toBe(again);
    expect(first).not.toContain(credential);
    expect(first).not.toBe(authorization);
    expect(first).toHaveLength(64);
  });

  test("creates opaque values for every boundary", () => {
    expect(createQaTesterCredentialValue()).toMatch(
      /^afterservice_qa_[A-Za-z0-9_-]{40,}$/,
    );
    expect(createQaAuthorizationToken()).toMatch(/^qaa_[A-Za-z0-9_-]{40,}$/);
    expect(createQaProfileReference()).toMatch(/^qap_[A-Za-z0-9_-]{40,}$/);
    expect(createQaSessionToken()).toMatch(/^qas_[a-f0-9]{64}$/);
  });
});

function activeAuthorization(overrides: Record<string, unknown> = {}) {
  return {
    clientIdDigest: "client-digest",
    expiresAt: new Date(Date.now() + 60_000),
    grant: {
      expiresAt: new Date(Date.now() + 120_000),
      qaDomain: "ishaq.qa.test",
      revokedAt: null,
      status: "ACTIVE",
      testerIdentity: "qa@example.test",
    },
    grantId: "grant-1",
    id: "authorization-1",
    revokedAt: null,
    status: "ACTIVE",
    ...overrides,
  };
}

describe("QA access lifecycle", () => {
  test("revalidates only an active authorization and grant", async () => {
    let updatedId: string | null = null;
    const db = {
      qaClientAuthorization: {
        findUnique: async () => activeAuthorization(),
        update: async ({ where }: { where: { id: string } }) => {
          updatedId = where.id;
        },
      },
    } as unknown as PrismaClient;

    const result = await revalidateQaClientAuthorization(db, {
      secret,
      token: "qaa_token",
    });

    expect(result.qaDomain).toBe("ishaq.qa.test");
    expect(updatedId).toBe("authorization-1");
  });

  test("rejects expired and revoked lifecycle state", async () => {
    for (const authorization of [
      activeAuthorization({ expiresAt: new Date(Date.now() - 1_000) }),
      activeAuthorization({
        grant: {
          ...activeAuthorization().grant,
          revokedAt: new Date(),
          status: "REVOKED",
        },
      }),
    ]) {
      const db = {
        qaClientAuthorization: {
          findUnique: async () => authorization,
          update: async () => undefined,
        },
      } as unknown as PrismaClient;

      await expect(
        revalidateQaClientAuthorization(db, {
          secret,
          token: "qaa_token",
        }),
      ).rejects.toBeInstanceOf(QaAccessError);
    }
  });

  test("rechecks the selected membership before creating an ordinary session", async () => {
    const now = Date.now();
    let membershipWhere: Record<string, unknown> | undefined;
    const sessionCreates: Array<Record<string, unknown>> = [];
    const transactionDb = {
      membership: {
        findFirst: async ({ where }: { where: Record<string, unknown> }) => {
          membershipWhere = where;
          return {
            id: "membership-1",
            role: "owner",
            user: {
              email: "owner@ishaq.qa.test",
              id: "user-1",
              name: "QA Owner",
            },
            userId: "user-1",
            workspace: {
              id: "workspace-1",
              name: "QA Garage",
              slug: "qa-garage",
            },
          };
        },
      },
      qaAccessAuditEvent: { create: async () => undefined },
      qaAccessProfileSelection: {
        findUnique: async () => ({
          authorizationId: "authorization-1",
          consumedAt: null,
          expiresAt: new Date(now + 60_000),
          id: "selection-1",
          membershipId: "membership-1",
          workspaceId: "workspace-1",
        }),
        updateMany: async () => ({ count: 1 }),
      },
      session: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          sessionCreates.push(data);
          return { expiresAt: data.expiresAt, token: data.token };
        },
      },
    };
    const db = {
      $transaction: async (callback: (tx: typeof transactionDb) => unknown) =>
        callback(transactionDb),
      qaClientAuthorization: {
        findUnique: async () => activeAuthorization(),
        update: async () => undefined,
      },
    } as unknown as PrismaClient;

    const result = await selectQaAccessProfile(db, {
      profileReference: "qap_reference",
      secret,
      token: "qaa_token",
    });

    expect(result.profile.workspaceId).toBe("workspace-1");
    expect(membershipWhere).toMatchObject({
      id: "membership-1",
      workspace: {
        dataClassification: "qa",
        id: "workspace-1",
        qaPurgeStartedAt: null,
        qaSourceDomain: "ishaq.qa.test",
        subscriptions: {
          none: { status: { in: ["active", "past_due"] } },
        },
      },
    });
    expect(sessionCreates).toHaveLength(1);
    expect(sessionCreates[0]).toMatchObject({
      qaAuthorizationId: "authorization-1",
      qaMembershipId: "membership-1",
      qaWorkspaceId: "workspace-1",
      userId: "user-1",
    });
  });

  test("revocation deletes every derived session", async () => {
    let deletedAuthorizationId: string | undefined;
    const db = {
      $transaction: async (operations: Array<Promise<unknown>>) =>
        Promise.all(operations),
      qaAccessAuditEvent: { create: async () => undefined },
      qaClientAuthorization: {
        findUnique: async () => activeAuthorization(),
        update: async () => undefined,
      },
      session: {
        deleteMany: async ({
          where,
        }: {
          where: { qaAuthorizationId: string };
        }) => {
          deletedAuthorizationId = where.qaAuthorizationId;
        },
      },
    } as unknown as PrismaClient;

    const result = await revokeQaClientAuthorization(db, {
      secret,
      token: "qaa_token",
    });

    expect(result.revoked).toBe(true);
    expect(deletedAuthorizationId).toBe("authorization-1");
  });
});
