"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@afterservice/ui";
import { JobCreateForm } from "@/components/forms/job-create-form";
import { useJobParams } from "@/hooks/use-job-params";

export function JobCreateSheet() {
  const { createJob, setParams } = useJobParams();

  return (
    <Sheet
      open={createJob ?? false}
      onOpenChange={(isOpen) => setParams({ createJob: isOpen ? true : null })}
    >
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Log completed job</SheetTitle>
          <SheetDescription>
            Record completed service work and queue the next follow-up.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <JobCreateForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}
