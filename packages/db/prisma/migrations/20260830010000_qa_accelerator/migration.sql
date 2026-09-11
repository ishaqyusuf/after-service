ALTER TABLE "Session"
ADD COLUMN "qaAuthorizationId" TEXT,
ADD COLUMN "qaMembershipId" TEXT,
ADD COLUMN "qaWorkspaceId" TEXT;

CREATE TABLE "QaTesterGrant" (
    "id" TEXT NOT NULL,
    "qaDomain" TEXT NOT NULL,
    "testerIdentity" TEXT NOT NULL,
    "credentialDigest" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "QaTesterGrant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QaClientAuthorization" (
    "id" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "clientIdDigest" TEXT NOT NULL,
    "clientPlatform" TEXT NOT NULL,
    "contractVersion" INTEGER NOT NULL,
    "tokenDigest" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastValidatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "QaClientAuthorization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QaAccessProfileSelection" (
    "id" TEXT NOT NULL,
    "authorizationId" TEXT NOT NULL,
    "referenceDigest" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QaAccessProfileSelection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QaAccessAttemptBucket" (
    "id" TEXT NOT NULL,
    "bucketDigest" TEXT NOT NULL,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "QaAccessAttemptBucket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QaAccessAuditEvent" (
    "id" TEXT NOT NULL,
    "grantId" TEXT,
    "authorizationId" TEXT,
    "eventType" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "domainDigest" TEXT,
    "clientDigest" TEXT,
    "networkDigest" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QaAccessAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Session_qaAuthorizationId_idx" ON "Session"("qaAuthorizationId");
CREATE INDEX "Session_qaMembershipId_qaWorkspaceId_idx" ON "Session"("qaMembershipId", "qaWorkspaceId");
CREATE UNIQUE INDEX "QaTesterGrant_credentialDigest_key" ON "QaTesterGrant"("credentialDigest");
CREATE INDEX "QaTesterGrant_qaDomain_status_expiresAt_idx" ON "QaTesterGrant"("qaDomain", "status", "expiresAt");
CREATE INDEX "QaTesterGrant_testerIdentity_status_idx" ON "QaTesterGrant"("testerIdentity", "status");
CREATE UNIQUE INDEX "QaClientAuthorization_tokenDigest_key" ON "QaClientAuthorization"("tokenDigest");
CREATE UNIQUE INDEX "QaClientAuthorization_grantId_clientIdDigest_clientPlatform_key" ON "QaClientAuthorization"("grantId", "clientIdDigest", "clientPlatform");
CREATE INDEX "QaClientAuthorization_status_expiresAt_idx" ON "QaClientAuthorization"("status", "expiresAt");
CREATE INDEX "QaClientAuthorization_clientIdDigest_clientPlatform_idx" ON "QaClientAuthorization"("clientIdDigest", "clientPlatform");
CREATE UNIQUE INDEX "QaAccessProfileSelection_referenceDigest_key" ON "QaAccessProfileSelection"("referenceDigest");
CREATE INDEX "QaAccessProfileSelection_authorizationId_expiresAt_idx" ON "QaAccessProfileSelection"("authorizationId", "expiresAt");
CREATE INDEX "QaAccessProfileSelection_membershipId_workspaceId_idx" ON "QaAccessProfileSelection"("membershipId", "workspaceId");
CREATE UNIQUE INDEX "QaAccessAttemptBucket_bucketDigest_key" ON "QaAccessAttemptBucket"("bucketDigest");
CREATE INDEX "QaAccessAttemptBucket_lockedUntil_idx" ON "QaAccessAttemptBucket"("lockedUntil");
CREATE INDEX "QaAccessAuditEvent_eventType_createdAt_idx" ON "QaAccessAuditEvent"("eventType", "createdAt");
CREATE INDEX "QaAccessAuditEvent_grantId_createdAt_idx" ON "QaAccessAuditEvent"("grantId", "createdAt");
CREATE INDEX "QaAccessAuditEvent_authorizationId_createdAt_idx" ON "QaAccessAuditEvent"("authorizationId", "createdAt");

ALTER TABLE "Session" ADD CONSTRAINT "Session_qaAuthorizationId_fkey" FOREIGN KEY ("qaAuthorizationId") REFERENCES "QaClientAuthorization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QaClientAuthorization" ADD CONSTRAINT "QaClientAuthorization_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "QaTesterGrant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QaAccessProfileSelection" ADD CONSTRAINT "QaAccessProfileSelection_authorizationId_fkey" FOREIGN KEY ("authorizationId") REFERENCES "QaClientAuthorization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QaAccessAuditEvent" ADD CONSTRAINT "QaAccessAuditEvent_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "QaTesterGrant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "QaAccessAuditEvent" ADD CONSTRAINT "QaAccessAuditEvent_authorizationId_fkey" FOREIGN KEY ("authorizationId") REFERENCES "QaClientAuthorization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
