export type JobResult = {
  ok: boolean;
  processed: number;
};

export async function runDueFollowUpsDryRun(): Promise<JobResult> {
  return {
    ok: true,
    processed: 0,
  };
}
