"use client";

import { Button } from "@afterservice/ui/button";
import { Icons } from "@afterservice/ui/icons";
import { PAGE_ACTION_CLASS } from "@/components/page-header";
import { useFollowUpParams } from "@/hooks/use-follow-up-params";

export function OpenFollowUpSheet() {
  const { setParams } = useFollowUpParams();

  return (
    <Button
      className={PAGE_ACTION_CLASS}
      onClick={() => setParams({ createFollowUp: true })}
    >
      <Icons.Add />
      <span>Plan follow-up</span>
    </Button>
  );
}
