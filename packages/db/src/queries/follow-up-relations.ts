import type { PrismaClient } from "../../generated/prisma/client";

export type FollowUpRelationsInput = {
  workspaceId: string;
  customerId?: string;
  jobId?: string;
  templateId?: string;
  assigneeId?: string | null;
};

export async function hasValidFollowUpRelations(
  db: PrismaClient,
  input: FollowUpRelationsInput,
) {
  const [job, template, assignee] = await Promise.all([
    input.jobId
      ? db.serviceJob.findFirst({
          select: { id: true },
          where: {
            id: input.jobId,
            workspaceId: input.workspaceId,
            customerId: input.customerId,
          },
        })
      : true,
    input.templateId
      ? db.followUpTemplate.findFirst({
          select: { id: true },
          where: { id: input.templateId, workspaceId: input.workspaceId },
        })
      : true,
    input.assigneeId
      ? db.membership.findFirst({
          select: { id: true },
          where: { id: input.assigneeId, workspaceId: input.workspaceId },
        })
      : true,
  ]);
  return Boolean(job && template && assignee);
}
