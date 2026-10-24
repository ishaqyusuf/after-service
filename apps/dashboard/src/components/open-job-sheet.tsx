"use client";

import { Button } from "@afterservice/ui/button";
import { Icons } from "@afterservice/ui/icons";
import { PAGE_ACTION_CLASS } from "@/components/page-header";
import { useJobParams } from "@/hooks/use-job-params";

export function OpenJobSheet() {
  const { setParams } = useJobParams();

  return (
    <Button
      className={PAGE_ACTION_CLASS}
      onClick={() => setParams({ createJob: true })}
    >
      <Icons.Add />
      <span>Add job</span>
    </Button>
  );
}
