"use client";

import { Sheet } from "@afterservice/ui";
import { FollowUpWorkForm } from "@/components/forms/follow-up-work-form";
import { trpc } from "@/components/providers/trpc-provider";
import { useFollowUpParams } from "@/hooks/use-follow-up-params";
import { DashboardSheetContent } from "./dashboard-sheet-content";
import { SheetFormSkeleton } from "./sheet-form-skeleton";
import { SheetMissingState } from "./sheet-missing-state";

export function FollowUpCardSheet() {
  const { followUpId, setParams } = useFollowUpParams();

  const { data: followUpData, isLoading } = trpc.followUps.get.useQuery(
    { id: followUpId! },
    { enabled: !!followUpId },
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) setParams(null);
  };

  return (
    <Sheet open={!!followUpId} onOpenChange={handleOpenChange}>
      <DashboardSheetContent
        bodyClassName=""
        title="Work follow-up"
        description="Update the state of this follow-up."
      >
        {isLoading ? (
          <SheetFormSkeleton fields={6} />
        ) : followUpData?.item ? (
          <FollowUpWorkForm followUp={followUpData.item} />
        ) : (
          <SheetMissingState
            title="Follow-up not found"
            description="This follow-up may have been completed, archived, or removed."
            onClose={() => setParams(null)}
          />
        )}
      </DashboardSheetContent>
    </Sheet>
  );
}
