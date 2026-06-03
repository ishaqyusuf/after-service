"use client";

import { Button } from "@afterservice/ui";
import { type FieldValues, useFormContext } from "react-hook-form";
import type { QuickFillArgs, QuickFillName } from "@/lib/quick-fill";

type QuickFillProps = {
  [Name in QuickFillName]: {
    args?: QuickFillArgs[Name];
    label?: string;
    name: Name;
  };
}[QuickFillName];

export function QuickFill({
  args,
  label = "Quick fill",
  name,
}: QuickFillProps) {
  const form = useFormContext<FieldValues>();

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  async function handleClick() {
    const { quickFillers } = await import("@/lib/quick-fill");
    const quickFill = quickFillers[name] as (
      targetForm: typeof form,
      args?: QuickFillArgs[typeof name],
    ) => void;
    quickFill(form, args);
  }

  return (
    <Button onClick={handleClick} size="sm" type="button" variant="ghost">
      {label}
    </Button>
  );
}
