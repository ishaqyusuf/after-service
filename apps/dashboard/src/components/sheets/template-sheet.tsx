"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@afterservice/ui";
import { TemplateEditForm } from "@/components/forms/template-edit-form";
import { trpc } from "@/components/providers/trpc-provider";
import { useTemplateParams } from "@/hooks/use-template-params";
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
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit template</SheetTitle>
          <SheetDescription>Update this follow-up template.</SheetDescription>
        </SheetHeader>

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
      </SheetContent>
    </Sheet>
  );
}
