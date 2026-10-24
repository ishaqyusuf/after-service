"use client";

import type { AppRouter } from "@afterservice/api/router";
import type { inferRouterOutputs } from "@trpc/server";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import { z } from "zod";
import { useZodForm } from "@/hooks/use-zod-form";
import { resolveTemplate } from "@/lib/dashboard-format";

export type FollowUp =
  inferRouterOutputs<AppRouter>["followUps"]["get"]["item"];

export const rescheduleSchema = z.object({
  id: z.string().min(1),
  dueAt: z.coerce.date(),
});

export const manualSendSchema = z.object({
  id: z.string().min(1),
  recipient: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export const markRepliedSchema = z.object({
  id: z.string().min(1),
  notes: z.string().optional(),
});

export const closeSchema = z.object({
  id: z.string().min(1),
  notes: z.string().optional(),
});

export function getSendDefaultValues(followUp: FollowUp) {
  const recipient = followUp.channel === "email" ? "" : "manual";
  const body = resolveTemplate(
    followUp.notes ?? "Checking in after your service.",
    {
      businessName: "afterservice",
      customerName: followUp.customerName,
      serviceName: followUp.serviceTitle,
    },
  );

  return {
    id: followUp.id,
    recipient,
    subject: "Checking in after your service",
    body,
  };
}

function useFollowUpForms(followUp: FollowUp | undefined) {
  const id = followUp?.id ?? "";
  const reschedule = useZodForm({
    schema: rescheduleSchema,
    defaultValues: {
      id,
      dueAt: followUp ? new Date(followUp.dueAt) : undefined,
    },
  });
  const send = useZodForm({
    schema: manualSendSchema,
    defaultValues: followUp
      ? getSendDefaultValues(followUp)
      : { id, recipient: "", subject: "", body: "" },
  });
  const replied = useZodForm({
    schema: markRepliedSchema,
    defaultValues: { id, notes: "" },
  });
  const close = useZodForm({
    schema: closeSchema,
    defaultValues: { id, notes: "" },
  });

  useEffect(() => {
    if (!followUp) return;
    reschedule.reset({
      id: followUp.id,
      dueAt: new Date(followUp.dueAt),
    });
    send.reset(getSendDefaultValues(followUp));
    replied.reset({ id: followUp.id, notes: "" });
    close.reset({ id: followUp.id, notes: "" });
  }, [followUp, reschedule, send, replied, close]);

  return { close, replied, reschedule, send };
}

type FollowUpFormContextValue = {
  followUp?: FollowUp;
  forms: ReturnType<typeof useFollowUpForms>;
};

const FollowUpFormContext = createContext<FollowUpFormContextValue | null>(
  null,
);

type FormContextProps = {
  children: ReactNode;
  data?: FollowUp;
};

// One follow-up, four actions: each action keeps its own validated form so
// drafts survive switching between actions inside the sheet.
export function FormContext({ children, data }: FormContextProps) {
  const forms = useFollowUpForms(data);

  return (
    <FollowUpFormContext.Provider value={{ followUp: data, forms }}>
      {children}
    </FollowUpFormContext.Provider>
  );
}

export function useFollowUpFormContext() {
  const context = useContext(FollowUpFormContext);
  if (!context) {
    throw new Error("useFollowUpFormContext must be used inside FormContext");
  }
  return context;
}
