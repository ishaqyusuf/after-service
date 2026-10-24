"use client";

import { Button } from "@afterservice/ui/button";
import { Icons } from "@afterservice/ui/icons";
import { PAGE_ACTION_CLASS } from "@/components/page-header";
import { useTemplateParams } from "@/hooks/use-template-params";

export function OpenTemplateSheet() {
  const { setParams } = useTemplateParams();

  return (
    <Button
      className={PAGE_ACTION_CLASS}
      onClick={() => setParams({ createTemplate: true })}
    >
      <Icons.Add />
      <span>Add template</span>
    </Button>
  );
}
