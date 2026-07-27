import { createHash } from "node:crypto";
import { getDbClient, type PrismaClient } from "../index";

function getQaDomainForEmail(email: string) {
  const configured = process.env.EMAIL_QA_DOMAIN_ROUTES;
  if (!configured) return null;
  const routes = JSON.parse(configured) as Record<string, string>;
  const domain = email.trim().toLowerCase().split("@").at(-1) ?? "";
  return Object.keys(routes).some(
    (candidate) =>
      candidate.trim().toLowerCase().replace(/^\.+/, "") === domain,
  )
    ? domain
    : null;
}

export function getQaWorkspaceClassification(email: string) {
  const qaSourceDomain = getQaDomainForEmail(email);
  return qaSourceDomain
    ? {
        dataClassification: "qa" as const,
        qaMarkedAt: new Date(),
        qaSourceDomain,
      }
    : {
        dataClassification: "normal" as const,
        qaMarkedAt: null,
        qaSourceDomain: null,
      };
}

export async function assertWorkspaceIdentityLane(
  input: { email: string; workspaceId: string },
  db: PrismaClient = getDbClient(),
) {
  const [workspace, identity] = await Promise.all([
    db.workspace.findUniqueOrThrow({
      where: { id: input.workspaceId },
      select: { dataClassification: true },
    }),
    db.user.findUnique({
      where: { email: input.email },
      select: {
        memberships: {
          select: { workspace: { select: { dataClassification: true } } },
        },
      },
    }),
  ]);
  const emailLane = getQaDomainForEmail(input.email) ? "qa" : "normal";
  if (
    workspace.dataClassification !== emailLane ||
    identity?.memberships.some(
      (membership) =>
        membership.workspace.dataClassification !==
        workspace.dataClassification,
    )
  ) {
    throw new Error("QA and normal identities cannot share a workspace.");
  }
}

export async function discoverQaWorkspaceCandidates(
  db: PrismaClient = getDbClient(),
) {
  const routes = process.env.EMAIL_QA_DOMAIN_ROUTES
    ? Object.keys(
        JSON.parse(process.env.EMAIL_QA_DOMAIN_ROUTES) as Record<
          string,
          string
        >,
      )
    : [];
  if (!routes.length) return [];
  return db.workspace.findMany({
    where: {
      dataClassification: "normal",
      memberships: {
        some: {
          role: "owner",
          user: {
            OR: routes.map((domain) => ({
              email: { endsWith: `@${domain}`, mode: "insensitive" as const },
            })),
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: { select: { memberships: true } },
    },
  });
}

export async function adoptQaWorkspaces(
  workspaceIds: string[],
  db: PrismaClient = getDbClient(),
) {
  return db.$transaction(async (tx) => {
    let adopted = 0;
    for (const id of workspaceIds) {
      const workspace = await tx.workspace.findUniqueOrThrow({
        where: { id },
        select: {
          dataClassification: true,
          memberships: {
            where: { role: "owner" },
            select: { user: { select: { email: true } } },
          },
        },
      });
      const domain = workspace.memberships
        .map((membership) => getQaDomainForEmail(membership.user.email))
        .find(Boolean);
      if (!domain || workspace.dataClassification !== "normal") {
        throw new Error("Only configured QA-domain candidates can be adopted.");
      }
      await tx.workspace.update({
        where: { id },
        data: {
          dataClassification: "qa",
          qaMarkedAt: new Date(),
          qaSourceDomain: domain,
        },
      });
      adopted += 1;
    }
    return { adopted };
  });
}

export async function previewQaWorkspacePurge(
  db: PrismaClient = getDbClient(),
) {
  const workspaces = await db.workspace.findMany({
    where: { dataClassification: "qa" },
    select: {
      id: true,
      qaMarkedAt: true,
      subscriptions: {
        select: { id: true, providerSubId: true, status: true },
      },
      _count: {
        select: {
          customers: true,
          followUps: true,
          jobs: true,
          memberships: true,
          messageLogs: true,
          templates: true,
        },
      },
    },
  });
  const blockers = workspaces.flatMap((workspace) =>
    workspace.subscriptions
      .filter((subscription) =>
        ["active", "past_due"].includes(subscription.status),
      )
      .map(() => "LIVE_PAID_SUBSCRIPTION"),
  );
  if (
    workspaces.some((workspace) =>
      workspace.subscriptions.some(
        (subscription) => subscription.status === "trialing",
      ),
    ) &&
    !process.env.POLAR_ACCESS_TOKEN?.trim()
  ) {
    blockers.push("SANDBOX_PROVIDER_CREDENTIAL_UNAVAILABLE");
  }
  const counts = workspaces.reduce(
    (sum, workspace) => {
      sum.workspaces += 1;
      sum.records +=
        1 +
        workspace._count.customers +
        workspace._count.followUps +
        workspace._count.jobs +
        workspace._count.memberships +
        workspace._count.messageLogs +
        workspace._count.templates;
      return sum;
    },
    { files: 0, fileBytes: 0, records: 0, workspaces: 0 },
  );
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify({
        counts,
        workspaces: workspaces.map((workspace) => [
          workspace.id,
          workspace.qaMarkedAt,
        ]),
      }),
    )
    .digest("hex");
  return { blockers, counts, fingerprint, workspaces };
}

export async function createQaWorkspacePurgeRun(actorUserId: string) {
  return getDbClient().qaPurgeRun.create({
    data: { activeKey: "global", actorUserId },
  });
}

export async function beginQaWorkspacePurge(runId: string) {
  const db = getDbClient();
  return db.$transaction(async (tx) => {
    await tx.qaPurgeRun.update({
      where: { id: runId },
      data: { startedAt: new Date(), status: "running" },
    });
    await tx.workspace.updateMany({
      where: { dataClassification: "qa" },
      data: { qaPurgeStartedAt: new Date() },
    });
    await tx.session.deleteMany({
      where: {
        user: {
          memberships: {
            some: { workspace: { dataClassification: "qa" } },
          },
        },
      },
    });
  });
}

export async function deleteQaWorkspace(
  workspaceId: string,
  db: PrismaClient = getDbClient(),
) {
  const workspace = await db.workspace.findFirstOrThrow({
    where: {
      id: workspaceId,
      dataClassification: "qa",
      qaPurgeStartedAt: { not: null },
    },
    select: {
      memberships: { select: { userId: true } },
      _count: {
        select: {
          customers: true,
          followUps: true,
          jobs: true,
          memberships: true,
          messageLogs: true,
          templates: true,
        },
      },
    },
  });
  await db.$transaction(async (tx) => {
    await tx.workspace.delete({ where: { id: workspaceId } });
    await tx.user.deleteMany({
      where: {
        id: {
          in: workspace.memberships.map((membership) => membership.userId),
        },
        memberships: { none: {} },
      },
    });
  });
  return (
    1 +
    workspace._count.customers +
    workspace._count.followUps +
    workspace._count.jobs +
    workspace._count.memberships +
    workspace._count.messageLogs +
    workspace._count.templates
  );
}

export async function finishQaWorkspacePurge(input: {
  runId: string;
  status: "completed" | "partial" | "failed" | "blocked";
  deletedWorkspaceCount?: number;
  deletedRecordCount?: number;
  errorCategory?: string;
}) {
  return getDbClient().qaPurgeRun.update({
    where: { id: input.runId },
    data: {
      activeKey: null,
      completedAt: new Date(),
      deletedRecordCount: input.deletedRecordCount ?? 0,
      deletedWorkspaceCount: input.deletedWorkspaceCount ?? 0,
      errorCategory: input.errorCategory,
      status: input.status,
    },
  });
}
