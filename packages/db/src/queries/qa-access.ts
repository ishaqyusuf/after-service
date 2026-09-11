import { createHmac, randomBytes, randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "../../generated/prisma/client";

const AUTHORIZATION_TTL_HOURS = 12;
const PROFILE_SELECTION_TTL_MINUTES = 10;
const QA_SESSION_TTL_HOURS = 8;
const ATTEMPT_WINDOW_MINUTES = 15;
const ATTEMPT_LOCK_MINUTES = 30;
const MAX_FAILED_ATTEMPTS = 5;

type AuditDb = PrismaClient | Prisma.TransactionClient;

export type QaAccessFailureCategory =
  | "authorization_required"
  | "locked"
  | "unavailable";

export class QaAccessError extends Error {
  category: QaAccessFailureCategory;

  constructor(category: QaAccessFailureCategory) {
    super("QA access could not be authorized.");
    this.name = "QaAccessError";
    this.category = category;
  }
}

function addMinutes(value: Date, minutes: number) {
  return new Date(value.getTime() + minutes * 60_000);
}

function addHours(value: Date, hours: number) {
  return addMinutes(value, hours * 60);
}

function earliestDate(...values: Date[]) {
  return new Date(Math.min(...values.map((value) => value.getTime())));
}

function normalizeQaDomain(domain: string) {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^\.+|\.+$/g, "");
}

export function digestQaAccessValue(
  secret: string,
  purpose: string,
  value: string,
) {
  if (secret.trim().length < 32) {
    throw new QaAccessError("unavailable");
  }
  return createHmac("sha256", secret)
    .update(`${purpose}:${value}`)
    .digest("hex");
}

export function createQaTesterCredentialValue() {
  return `afterservice_qa_${randomBytes(32).toString("base64url")}`;
}

export function createQaAuthorizationToken() {
  return `qaa_${randomBytes(32).toString("base64url")}`;
}

export function createQaProfileReference() {
  return `qap_${randomBytes(32).toString("base64url")}`;
}

export function createQaSessionToken() {
  return `qas_${randomBytes(32).toString("hex")}`;
}

function redactedDigest(
  secret: string,
  purpose: string,
  value: string | null | undefined,
) {
  return value
    ? digestQaAccessValue(secret, purpose, value).slice(0, 24)
    : null;
}

async function recordAudit(
  db: AuditDb,
  input: {
    authorizationId?: string | null;
    clientIdDigest?: string | null;
    domain?: string | null;
    eventType: string;
    grantId?: string | null;
    metadata?: Record<string, string | number | boolean | null>;
    networkSource?: string | null;
    outcome: string;
    secret: string;
  },
) {
  await db.qaAccessAuditEvent.create({
    data: {
      authorizationId: input.authorizationId,
      clientDigest: redactedDigest(
        input.secret,
        "audit-client",
        input.clientIdDigest,
      ),
      domainDigest: redactedDigest(input.secret, "audit-domain", input.domain),
      eventType: input.eventType,
      grantId: input.grantId,
      metadata: input.metadata,
      networkDigest: redactedDigest(
        input.secret,
        "audit-network",
        input.networkSource,
      ),
      outcome: input.outcome,
    },
  });
}

export async function issueQaTesterCredential(
  db: PrismaClient,
  input: {
    expiresAt: Date;
    qaDomain: string;
    secret: string;
    testerIdentity: string;
  },
) {
  const qaDomain = normalizeQaDomain(input.qaDomain);
  const testerIdentity = input.testerIdentity.trim().toLowerCase();
  if (
    !qaDomain.endsWith(".test") ||
    !testerIdentity ||
    input.expiresAt <= new Date()
  ) {
    throw new Error(
      "A configured QA domain, tester identity, and future expiry are required.",
    );
  }

  const credential = createQaTesterCredentialValue();
  const grant = await db.qaTesterGrant.create({
    data: {
      credentialDigest: digestQaAccessValue(
        input.secret,
        "tester-credential",
        credential,
      ),
      expiresAt: input.expiresAt,
      qaDomain,
      testerIdentity,
    },
    select: {
      expiresAt: true,
      id: true,
      qaDomain: true,
      testerIdentity: true,
    },
  });
  await recordAudit(db, {
    domain: qaDomain,
    eventType: "credential_issued",
    grantId: grant.id,
    outcome: "success",
    secret: input.secret,
  });

  return { credential, grant };
}

export async function revokeQaTesterGrant(
  db: PrismaClient,
  input: { grantId: string; secret: string },
) {
  const grant = await db.qaTesterGrant.findUnique({
    where: { id: input.grantId },
  });
  if (!grant) return { revoked: false };

  const authorizations = await db.qaClientAuthorization.findMany({
    select: { id: true },
    where: { grantId: grant.id },
  });
  const authorizationIds = authorizations.map((entry) => entry.id);
  const revokedAt = new Date();
  await db.$transaction([
    db.qaTesterGrant.update({
      data: { revokedAt, status: "REVOKED" },
      where: { id: grant.id },
    }),
    db.qaClientAuthorization.updateMany({
      data: { revokedAt, status: "REVOKED" },
      where: { grantId: grant.id },
    }),
    db.session.deleteMany({
      where: { qaAuthorizationId: { in: authorizationIds } },
    }),
  ]);
  await recordAudit(db, {
    domain: grant.qaDomain,
    eventType: "credential_revoked",
    grantId: grant.id,
    outcome: "success",
    secret: input.secret,
  });
  return { revoked: true };
}

function attemptBucketDigests(
  secret: string,
  input: { clientId: string; domain: string; networkSource?: string | null },
) {
  const buckets = [
    digestQaAccessValue(
      secret,
      "exchange-attempt-client",
      `${input.domain}|${input.clientId}`,
    ),
  ];
  if (input.networkSource) {
    buckets.push(
      digestQaAccessValue(
        secret,
        "exchange-attempt-network",
        `${input.domain}|${input.networkSource}`,
      ),
    );
  }
  return buckets;
}

async function assertExchangeNotLocked(
  db: PrismaClient,
  bucketDigest: string,
  now: Date,
) {
  const bucket = await db.qaAccessAttemptBucket.findUnique({
    where: { bucketDigest },
  });
  if (bucket?.lockedUntil && bucket.lockedUntil > now) {
    throw new QaAccessError("locked");
  }
}

async function recordFailedExchange(
  db: PrismaClient,
  input: { bucketDigest: string; now: Date },
) {
  const windowCutoff = addMinutes(input.now, -ATTEMPT_WINDOW_MINUTES);
  const nextLockedUntil = addMinutes(input.now, ATTEMPT_LOCK_MINUTES);

  await db.$executeRaw`
    INSERT INTO "QaAccessAttemptBucket" (
      "id", "bucketDigest", "failedCount", "windowStartedAt",
      "lockedUntil", "createdAt", "updatedAt"
    ) VALUES (
      ${randomUUID()}, ${input.bucketDigest}, 1, ${input.now},
      NULL, ${input.now}, ${input.now}
    )
    ON CONFLICT ("bucketDigest") DO UPDATE SET
      "failedCount" = CASE
        WHEN "QaAccessAttemptBucket"."windowStartedAt" <= ${windowCutoff}
          THEN 1
        ELSE "QaAccessAttemptBucket"."failedCount" + 1
      END,
      "windowStartedAt" = CASE
        WHEN "QaAccessAttemptBucket"."windowStartedAt" <= ${windowCutoff}
          THEN ${input.now}
        ELSE "QaAccessAttemptBucket"."windowStartedAt"
      END,
      "lockedUntil" = CASE
        WHEN "QaAccessAttemptBucket"."windowStartedAt" <= ${windowCutoff}
          THEN NULL
        WHEN "QaAccessAttemptBucket"."failedCount" + 1 >= ${MAX_FAILED_ATTEMPTS}
          THEN ${nextLockedUntil}
        ELSE "QaAccessAttemptBucket"."lockedUntil"
      END,
      "updatedAt" = ${input.now}
  `;
}

export async function exchangeQaTesterCredential(
  db: PrismaClient,
  input: {
    clientId: string;
    clientPlatform: "web";
    contractVersion: number;
    credential: string;
    networkSource?: string | null;
    qaDomain: string;
    secret: string;
  },
) {
  const now = new Date();
  const qaDomain = normalizeQaDomain(input.qaDomain);
  const clientId = input.clientId.trim();
  if (!clientId) throw new QaAccessError("authorization_required");
  const clientIdDigest = digestQaAccessValue(
    input.secret,
    "client-identity",
    clientId,
  );
  const bucketDigests = attemptBucketDigests(input.secret, {
    clientId,
    domain: qaDomain,
    networkSource: input.networkSource,
  });

  for (const bucketDigest of bucketDigests) {
    await assertExchangeNotLocked(db, bucketDigest, now);
  }

  const grant = await db.qaTesterGrant.findFirst({
    where: {
      credentialDigest: digestQaAccessValue(
        input.secret,
        "tester-credential",
        input.credential,
      ),
      expiresAt: { gt: now },
      qaDomain,
      revokedAt: null,
      status: "ACTIVE",
    },
  });
  if (!grant) {
    for (const bucketDigest of bucketDigests) {
      await recordFailedExchange(db, { bucketDigest, now });
    }
    await recordAudit(db, {
      clientIdDigest,
      domain: qaDomain,
      eventType: "credential_exchange",
      networkSource: input.networkSource,
      outcome: "denied",
      secret: input.secret,
    });
    throw new QaAccessError("authorization_required");
  }

  const token = createQaAuthorizationToken();
  const expiresAt = earliestDate(
    addHours(now, AUTHORIZATION_TTL_HOURS),
    grant.expiresAt,
  );
  const authorization = await db.qaClientAuthorization.upsert({
    create: {
      clientIdDigest,
      clientPlatform: input.clientPlatform,
      contractVersion: input.contractVersion,
      expiresAt,
      grantId: grant.id,
      tokenDigest: digestQaAccessValue(
        input.secret,
        "client-authorization",
        token,
      ),
    },
    update: {
      contractVersion: input.contractVersion,
      expiresAt,
      lastValidatedAt: now,
      revokedAt: null,
      status: "ACTIVE",
      tokenDigest: digestQaAccessValue(
        input.secret,
        "client-authorization",
        token,
      ),
    },
    where: {
      grantId_clientIdDigest_clientPlatform: {
        clientIdDigest,
        clientPlatform: input.clientPlatform,
        grantId: grant.id,
      },
    },
  });
  await db.qaAccessAttemptBucket.deleteMany({
    where: { bucketDigest: { in: bucketDigests } },
  });
  await recordAudit(db, {
    authorizationId: authorization.id,
    clientIdDigest,
    domain: qaDomain,
    eventType: "credential_exchange",
    grantId: grant.id,
    networkSource: input.networkSource,
    outcome: "success",
    secret: input.secret,
  });

  return {
    authorization: {
      expiresAt: authorization.expiresAt,
      qaDomain,
      testerIdentity: grant.testerIdentity,
    },
    token,
  };
}

async function getActiveAuthorization(
  db: PrismaClient,
  input: { secret: string; token: string },
) {
  const now = new Date();
  const authorization = await db.qaClientAuthorization.findUnique({
    where: {
      tokenDigest: digestQaAccessValue(
        input.secret,
        "client-authorization",
        input.token,
      ),
    },
    include: { grant: true },
  });
  if (
    !authorization ||
    authorization.status !== "ACTIVE" ||
    authorization.revokedAt ||
    authorization.expiresAt <= now ||
    authorization.grant.status !== "ACTIVE" ||
    authorization.grant.revokedAt ||
    authorization.grant.expiresAt <= now
  ) {
    throw new QaAccessError("authorization_required");
  }

  await db.qaClientAuthorization.update({
    data: { lastValidatedAt: now },
    where: { id: authorization.id },
  });
  return authorization;
}

export async function revalidateQaClientAuthorization(
  db: PrismaClient,
  input: { secret: string; token: string },
) {
  const authorization = await getActiveAuthorization(db, input);
  return {
    expiresAt: authorization.expiresAt,
    qaDomain: authorization.grant.qaDomain,
    testerIdentity: authorization.grant.testerIdentity,
  };
}

export async function listQaAccessProfiles(
  db: PrismaClient,
  input: { secret: string; token: string },
) {
  const authorization = await getActiveAuthorization(db, input);
  const memberships = await db.membership.findMany({
    where: {
      workspace: {
        dataClassification: "qa",
        qaPurgeStartedAt: null,
        qaSourceDomain: authorization.grant.qaDomain,
        subscriptions: {
          none: { status: { in: ["active", "past_due"] } },
        },
      },
    },
    orderBy: [{ workspace: { name: "asc" } }, { createdAt: "asc" }],
    select: {
      id: true,
      role: true,
      user: { select: { email: true, id: true, name: true } },
      workspace: { select: { id: true, name: true, slug: true } },
    },
  });

  await db.qaAccessProfileSelection.deleteMany({
    where: {
      authorizationId: authorization.id,
      expiresAt: { lte: new Date() },
    },
  });

  const profiles = memberships.map((membership) => {
    const profileReference = createQaProfileReference();
    return {
      identity: {
        email: membership.user.email,
        id: membership.user.id,
        name: membership.user.name || membership.user.email,
      },
      membership: { role: membership.role },
      profileReference,
      selection: {
        authorizationId: authorization.id,
        expiresAt: addMinutes(new Date(), PROFILE_SELECTION_TTL_MINUTES),
        membershipId: membership.id,
        referenceDigest: digestQaAccessValue(
          input.secret,
          "profile-selection",
          profileReference,
        ),
        workspaceId: membership.workspace.id,
      },
      workspace: membership.workspace,
    };
  });
  if (profiles.length) {
    await db.qaAccessProfileSelection.createMany({
      data: profiles.map((profile) => profile.selection),
    });
  }
  return profiles.map(({ selection: _selection, ...profile }) => profile);
}

export async function selectQaAccessProfile(
  db: PrismaClient,
  input: {
    profileReference: string;
    secret: string;
    token: string;
    userAgent?: string | null;
  },
) {
  const authorization = await getActiveAuthorization(db, input);
  const now = new Date();

  return db.$transaction(async (tx) => {
    const selection = await tx.qaAccessProfileSelection.findUnique({
      where: {
        referenceDigest: digestQaAccessValue(
          input.secret,
          "profile-selection",
          input.profileReference,
        ),
      },
    });
    if (
      !selection ||
      selection.authorizationId !== authorization.id ||
      selection.consumedAt ||
      selection.expiresAt <= now
    ) {
      throw new QaAccessError("authorization_required");
    }

    const membership = await tx.membership.findFirst({
      where: {
        id: selection.membershipId,
        workspace: {
          dataClassification: "qa",
          id: selection.workspaceId,
          qaPurgeStartedAt: null,
          qaSourceDomain: authorization.grant.qaDomain,
          subscriptions: {
            none: { status: { in: ["active", "past_due"] } },
          },
        },
      },
      select: {
        id: true,
        role: true,
        user: { select: { email: true, id: true, name: true } },
        userId: true,
        workspace: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!membership) {
      throw new QaAccessError("authorization_required");
    }

    const consumed = await tx.qaAccessProfileSelection.updateMany({
      data: { consumedAt: now },
      where: { consumedAt: null, id: selection.id },
    });
    if (consumed.count !== 1) {
      throw new QaAccessError("authorization_required");
    }

    const session = await tx.session.create({
      data: {
        expiresAt: earliestDate(
          addHours(now, QA_SESSION_TTL_HOURS),
          authorization.expiresAt,
          authorization.grant.expiresAt,
        ),
        qaAuthorizationId: authorization.id,
        qaMembershipId: membership.id,
        qaWorkspaceId: membership.workspace.id,
        token: createQaSessionToken(),
        userAgent: input.userAgent,
        userId: membership.userId,
      },
    });
    await recordAudit(tx, {
      authorizationId: authorization.id,
      clientIdDigest: authorization.clientIdDigest,
      domain: authorization.grant.qaDomain,
      eventType: "profile_selected",
      grantId: authorization.grantId,
      outcome: "success",
      secret: input.secret,
    });

    return {
      expiresAt: session.expiresAt,
      profile: {
        email: membership.user.email,
        id: membership.user.id,
        name: membership.user.name || membership.user.email,
        role: membership.role,
        workspaceId: membership.workspace.id,
        workspaceName: membership.workspace.name,
        workspaceSlug: membership.workspace.slug,
      },
      token: session.token,
    };
  });
}

export async function revokeQaClientAuthorization(
  db: PrismaClient,
  input: { secret: string; token: string },
) {
  const tokenDigest = digestQaAccessValue(
    input.secret,
    "client-authorization",
    input.token,
  );
  const authorization = await db.qaClientAuthorization.findUnique({
    where: { tokenDigest },
    include: { grant: true },
  });
  if (!authorization) return { revoked: false };

  const revokedAt = new Date();
  await db.$transaction([
    db.qaClientAuthorization.update({
      data: { revokedAt, status: "REVOKED" },
      where: { id: authorization.id },
    }),
    db.session.deleteMany({
      where: { qaAuthorizationId: authorization.id },
    }),
  ]);
  await recordAudit(db, {
    authorizationId: authorization.id,
    clientIdDigest: authorization.clientIdDigest,
    domain: authorization.grant.qaDomain,
    eventType: "authorization_revoked",
    grantId: authorization.grantId,
    outcome: "success",
    secret: input.secret,
  });
  return { revoked: true };
}

export async function validateQaDerivedSession(
  db: PrismaClient,
  sessionId: string,
) {
  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { qaAuthorization: { include: { grant: true } } },
  });
  if (!session) return { active: false, scope: null };
  if (!session.qaAuthorizationId) return { active: true, scope: null };

  const now = new Date();
  const authorization = session.qaAuthorization;
  const membership = session.qaMembershipId
    ? await db.membership.findFirst({
        where: {
          id: session.qaMembershipId,
          workspace: {
            dataClassification: "qa",
            id: session.qaWorkspaceId ?? "",
            qaPurgeStartedAt: null,
            qaSourceDomain: authorization?.grant.qaDomain,
            subscriptions: {
              none: { status: { in: ["active", "past_due"] } },
            },
          },
        },
        select: { id: true },
      })
    : null;
  const active = Boolean(
    authorization &&
      authorization.status === "ACTIVE" &&
      !authorization.revokedAt &&
      authorization.expiresAt > now &&
      authorization.grant.status === "ACTIVE" &&
      !authorization.grant.revokedAt &&
      authorization.grant.expiresAt > now &&
      membership,
  );
  if (!active) {
    await db.session.deleteMany({ where: { id: sessionId } });
  }
  return {
    active,
    scope:
      active && session.qaMembershipId && session.qaWorkspaceId
        ? {
            authorizationId: session.qaAuthorizationId,
            membershipId: session.qaMembershipId,
            qaDomain: authorization?.grant.qaDomain ?? null,
            workspaceId: session.qaWorkspaceId,
          }
        : null,
  };
}
