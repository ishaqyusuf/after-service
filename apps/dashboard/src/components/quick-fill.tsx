"use client";

import { Button } from "@afterservice/ui";
import { useQuery } from "@tanstack/react-query";
import { type FieldValues, useFormContext } from "react-hook-form";
import { useRef, useState } from "react";
import {
  type QuickFillArgs,
  type QuickFillName,
} from "@/lib/quick-fill";

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
  const invocation = useRef(0);
  const [resetValues, setResetValues] = useState<FieldValues | null>(null);
  const { data: fixtureContext } = useQuery({
    queryKey: ["qa-accelerator", "fixture-context"],
    queryFn: async () => {
      const response = await fetch("/api/qa-access/fixture-context", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!response.ok) return { enabled: false as const };
      return (await response.json()) as {
        enabled: true;
        qaDomain: string;
        seed: string;
      };
    },
    retry: false,
    staleTime: 60_000,
  });

  if (!fixtureContext?.enabled) {
    return null;
  }

  const { qaDomain, seed } = fixtureContext;

  async function handleClick() {
    const { applyQuickFill } = await import("@/lib/quick-fill");
    if (!resetValues) {
      setResetValues(structuredClone(form.getValues()));
    }
    invocation.current += 1;
    applyQuickFill(form, {
      name,
      ...(args ?? {}),
    }, {
      invocation: invocation.current,
      qaDomain,
      seed,
    });
  }

  function handleReset() {
    if (!resetValues) return;
    form.reset(resetValues);
    invocation.current = 0;
    setResetValues(null);
  }

  return (
    <span className="inline-flex items-center gap-1">
      <Button onClick={handleClick} size="sm" type="button" variant="ghost">
        {resetValues ? `Regenerate ${label.toLowerCase()}` : label}
      </Button>
      {resetValues ? (
        <Button onClick={handleReset} size="sm" type="button" variant="ghost">
          Reset
        </Button>
      ) : null}
    </span>
  );
}
