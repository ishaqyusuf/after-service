"use client";

import { Sheet } from "@afterservice/ui";
import { useQuery } from "@tanstack/react-query";
import { FormContext } from "@/components/follow-up/form-context";
import { FollowUpContent } from "@/components/follow-up-content";
import { useFollowUpParams } from "@/hooks/use-follow-up-params";
import { useTRPC } from "@/trpc/client";

export function FollowUpCardSheet() {
  const trpc = useTRPC();
  const { followUpId, setParams } = useFollowUpParams();
  const followUpQueryId = followUpId ?? "";

  const { data: followUpData, isLoading } = useQuery(
    trpc.followUps.get.queryOptions(
      { id: followUpQueryId },
      {
        enabled: !!followUpId,
        placeholderData: (previous) => (followUpId ? undefined : previous),
      },
    ),
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) setParams(null);
  };

  return (
    <Sheet open={!!followUpId} onOpenChange={handleOpenChange}>
      <FormContext data={followUpData?.item}>
        <FollowUpContent isLoading={isLoading} />
      </FormContext>
    </Sheet>
  );
}
