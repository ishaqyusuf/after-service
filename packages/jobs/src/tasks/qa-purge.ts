import {
  beginQaWorkspacePurge,
  deleteQaWorkspace,
  finishQaWorkspacePurge,
  getDbClient,
  previewQaWorkspacePurge,
} from "@afterservice/db";
import { Polar } from "@polar-sh/sdk";
import { task } from "@trigger.dev/sdk/v3";

export const qaPurgeTask = task({
  id: "qa-purge",
  maxDuration: 60 * 30,
  run: async (payload: { runId: string }) => {
    const db = getDbClient();
    const run = await db.qaPurgeRun.findUnique({
      where: { id: payload.runId },
    });
    if (!run || run.status !== "pending") return;

    const preview = await previewQaWorkspacePurge(db);
    if (preview.blockers.length) {
      await finishQaWorkspacePurge({
        runId: payload.runId,
        status: "blocked",
        errorCategory: preview.blockers[0],
      });
      return;
    }

    await beginQaWorkspacePurge(payload.runId);
    const polarToken = process.env.POLAR_ACCESS_TOKEN?.trim();
    const polar = polarToken
      ? new Polar({ accessToken: polarToken, server: "sandbox" })
      : null;
    let workspaces = 0;
    let records = 0;
    let errorCategory: string | undefined;
    for (const workspace of preview.workspaces) {
      try {
        for (const subscription of workspace.subscriptions) {
          if (subscription.status !== "trialing") continue;
          if (!polar)
            throw new Error("Sandbox provider credential unavailable.");
          try {
            await polar.subscriptions.revoke({
              id: subscription.providerSubId,
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : "";
            if (!/not found|404|already canceled/i.test(message)) throw error;
          }
        }
        records += await deleteQaWorkspace(workspace.id, db);
        workspaces += 1;
      } catch (error) {
        errorCategory = error instanceof Error ? error.name : "QA_PURGE_FAILED";
      }
    }
    await finishQaWorkspacePurge({
      runId: payload.runId,
      status:
        workspaces === preview.workspaces.length
          ? "completed"
          : workspaces
            ? "partial"
            : "failed",
      deletedRecordCount: records,
      deletedWorkspaceCount: workspaces,
      errorCategory,
    });
  },
});
