import {
  type FollowUpRelationsInput,
  hasValidFollowUpRelations,
  type Prisma,
} from "@afterservice/db";
import { TRPCError } from "@trpc/server";

/** Validate optional relations before a follow-up can expose their data. */
export async function assertFollowUpRelations(
  db: Prisma.TransactionClient,
  input: FollowUpRelationsInput,
) {
  if (!(await hasValidFollowUpRelations(db, input))) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Follow-up relation not found in this workspace.",
    });
  }
}
