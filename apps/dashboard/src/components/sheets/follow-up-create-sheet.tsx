"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@afterservice/ui";
import { FollowUpCreateForm } from "@/components/forms/follow-up-create-form";
import { useFollowUpParams } from "@/hooks/use-follow-up-params";

export function FollowUpCreateSheet() {
  const { createFollowUp, setParams } = useFollowUpParams();

  return (
    <Sheet
      open={createFollowUp ?? false}
      onOpenChange={(isOpen) =>
        setParams({ createFollowUp: isOpen ? true : null })
      }
    >
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create follow-up</SheetTitle>
          <SheetDescription>
            Schedule the next customer touchpoint after a completed service.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <FollowUpCreateForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}
