"use client";

import { Sheet } from "@afterservice/ui";
import { TemplateEditForm } from "@/components/forms/template-edit-form";
import { trpc } from "@/components/providers/trpc-provider";
import { useTemplateParams } from "@/hooks/use-template-params";
import { DashboardSheetContent } from "./dashboard-sheet-content";
import { SheetFormSkeleton } from "./sheet-form-skeleton";
import { SheetMissingState } from "./sheet-missing-state";

export function TemplateSheet() {
  const { templateId, setParams } = useTemplateParams();

  const { data: templateData, isLoading } = trpc.templates.get.useQuery(
    { id: templateId! },
    { enabled: !!templateId },
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) setParams(null);
  };

  return (
    <Sheet open={!!templateId} onOpenChange={handleOpenChange}>
      <DashboardSheetContent
        bodyClassName=""
        title="Edit template"
        description="Update this follow-up template."
      >
        {isLoading ? (
          <SheetFormSkeleton fields={5} />
        ) : templateData?.item ? (
          <TemplateEditForm template={templateData.item} />
        ) : (
          <SheetMissingState
            title="Template not found"
            description="This template may have been archived or removed."
            onClose={() => setParams(null)}
          />
        )}
      </DashboardSheetContent>
    </Sheet>
  );
}
