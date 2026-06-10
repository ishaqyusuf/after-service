"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@afterservice/ui";
import { TemplateCreateForm } from "@/components/forms/template-create-form";
import { useTemplateParams } from "@/hooks/use-template-params";

export function TemplateCreateSheet() {
  const { createTemplate, setParams } = useTemplateParams();

  return (
    <Sheet
      open={createTemplate ?? false}
      onOpenChange={(isOpen) =>
        setParams({ createTemplate: isOpen ? true : null })
      }
    >
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create template</SheetTitle>
          <SheetDescription>
            Add a reusable follow-up message for completed service work.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <TemplateCreateForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}
