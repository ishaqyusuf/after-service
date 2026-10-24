"use client";
import type { AppRouter } from "@afterservice/api/router";
import {
  type ActionName,
  actionSchema,
  capabilities,
} from "@afterservice/assistant";
import { Button, Input, Textarea } from "@afterservice/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useAssistant } from "./assistant-provider";

type Conversation = inferRouterOutputs<AppRouter>["assistant"]["conversation"];
type Proposal = Conversation["proposals"][number];
type Receipt = Conversation["receipts"][number];
const labels: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  companyName: "Company",
  tags: "Tags, separated by commas",
  notes: "Notes",
  title: "Service title",
  completedAt: "Completed date and time",
  amount: "Job value",
  currency: "Currency",
  serviceCategory: "Service category",
  nextFollowUpAt: "Next follow-up date and time",
  dueAt: "Follow-up date and time",
  channel: "Channel",
  recipient: "Phone number contacted",
  body: "Message",
  subject: "Subject",
  isDefault: "Default template",
  businessType: "Business type",
  defaultFollowUpDelayDays: "Default follow-up delay (days)",
  assigneeId: "Assigned team member",
  templateId: "Template",
  customerId: "Customer",
  jobId: "Service job",
  status: "Status",
};
const fieldSets: Record<ActionName, string[]> = {
  "customer.create": ["name", "email", "phone", "companyName", "tags", "notes"],
  "customer.update": ["name", "email", "phone", "companyName", "tags", "notes"],
  "customer.archive": [],
  "job.create": [
    "title",
    "completedAt",
    "amount",
    "currency",
    "serviceCategory",
    "notes",
    "nextFollowUpAt",
  ],
  "job.update": [
    "title",
    "completedAt",
    "amount",
    "currency",
    "serviceCategory",
    "notes",
    "nextFollowUpAt",
    "status",
  ],
  "job.complete": [],
  "job.followUp": ["dueAt", "channel", "notes"],
  "followUp.create": ["dueAt", "channel", "notes"],
  "followUp.update": ["dueAt", "channel", "notes"],
  "followUp.reschedule": ["dueAt"],
  "followUp.assign": ["assigneeId"],
  "followUp.logPhone": ["recipient", "body"],
  "followUp.reply": ["notes"],
  "followUp.close": ["notes"],
  "template.create": ["name", "channel", "subject", "body", "isDefault"],
  "template.update": ["name", "channel", "subject", "body", "isDefault"],
  "template.archive": [],
  "template.default": [],
  "workspace.update": [
    "name",
    "businessType",
    "serviceCategory",
    "defaultFollowUpDelayDays",
  ],
};
function display(value: unknown, field?: string) {
  if (
    field?.endsWith("At") &&
    typeof value === "string" &&
    Number.isFinite(new Date(value).getTime())
  )
    return `${new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
  return value === null || value === undefined || value === ""
    ? "Not set"
    : String(value);
}
function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
export function AssistantProposalCard({
  proposal,
  receipt,
}: {
  proposal: Proposal;
  receipt?: Receipt;
}) {
  const a = useAssistant();
  const trpc = useTRPC();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string>();
  const confirm = useMutation(trpc.assistant.confirm.mutationOptions());
  const edit = useMutation(trpc.assistant.edit.mutationOptions());
  const cancel = useMutation(trpc.assistant.cancel.mutationOptions());
  const directory = useQuery(
    trpc.assistant.read.queryOptions(
      {
        read: { kind: "members" },
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      { enabled: editing && proposal.action === "followUp.assign" },
    ),
  );
  const parsed = actionSchema.safeParse(proposal.payload);
  if (!parsed.success)
    return (
      <p role="alert" className="text-sm text-destructive">
        This draft is no longer supported. Prepare a new one.
      </p>
    );
  const action = parsed.data;
  const capability = capabilities[action.action];
  const input: Record<string, unknown> = action.input;
  const snapshots = Array.isArray(proposal.snapshot)
    ? proposal.snapshot.map(object)
    : [];
  const before = object(snapshots[0]?.before);
  const expired = new Date(proposal.expiresAt) <= new Date();
  const handled = proposal.state !== "draft";
  const pending = confirm.isPending || edit.isPending || cancel.isPending;
  async function finish() {
    await Promise.all([
      a.refresh(),
      qc.invalidateQueries({
        predicate: (query) => {
          const first = query.queryKey[0];
          return (
            Array.isArray(first) &&
            [
              "customers",
              "serviceJobs",
              "followUps",
              "templates",
              "workspace",
              "dashboard",
              "billing",
            ].includes(String(first[0]))
          );
        },
      }),
    ]);
  }
  const fields = fieldSets[action.action];
  return (
    <div className="my-3 overflow-hidden rounded-md border bg-background text-sm">
      <div className="border-b bg-muted/40 px-3 py-2">
        <p className="font-medium">{capability.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {handled
            ? proposal.state === "confirmed"
              ? "Saved"
              : "Canceled"
            : expired
              ? "Draft expired"
              : "Review before saving"}
        </p>
      </div>
      <div className="space-y-3 p-3">
        {snapshots.map((entry) => {
          const data = object(entry.before);
          return (
            <p
              key={`${entry.kind}-${entry.id}`}
              className="text-xs text-muted-foreground"
            >
              {String(entry.kind)}:{" "}
              {String(
                data.name ??
                  data.title ??
                  (entry.kind === "member"
                    ? "Selected team member"
                    : "Selected record"),
              )}
            </p>
          );
        })}
        {editing ? (
          <form
            id={`edit-${proposal.id}`}
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              setError(undefined);
              try {
                const next: Record<string, unknown> = { ...input, ...values };
                for (const key of Object.keys(next))
                  if (next[key] === "" && !Object.hasOwn(input, key))
                    delete next[key];
                const checked = actionSchema.safeParse({
                  action: action.action,
                  input: next,
                });
                if (!checked.success)
                  throw Error(
                    checked.error.issues[0]?.message ??
                      "Check the draft details.",
                  );
                await edit.mutateAsync({
                  id: proposal.id,
                  revision: proposal.revision,
                  conversationId: proposal.conversationId,
                  action: checked.data,
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                });
                setEditing(false);
                await finish();
              } catch (e) {
                setError(
                  e instanceof Error
                    ? e.message
                    : "Could not save draft changes.",
                );
              }
            }}
          >
            {fields.map((field) => (
              <label
                key={field}
                htmlFor={`assistant-${proposal.id}-${field}`}
                className="block text-xs"
              >
                <span className="mb-1 block font-medium">
                  {labels[field] ?? field}
                </span>
                {field === "channel" ? (
                  <select
                    id={`assistant-${proposal.id}-${field}`}
                    className="w-full rounded border bg-background p-2"
                    value={String(values[field] ?? input[field] ?? "email")}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field]: e.target.value }))
                    }
                  >
                    {["email", "phone", "sms", "whatsapp"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                ) : field === "status" ? (
                  <select
                    id={`assistant-${proposal.id}-${field}`}
                    className="w-full rounded border bg-background p-2"
                    value={String(values[field] ?? input[field] ?? "completed")}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field]: e.target.value }))
                    }
                  >
                    {["completed", "needs_follow_up", "resolved"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                ) : field === "isDefault" ? (
                  <input
                    id={`assistant-${proposal.id}-${field}`}
                    type="checkbox"
                    checked={Boolean(values[field] ?? input[field])}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field]: e.target.checked }))
                    }
                  />
                ) : field === "assigneeId" ? (
                  <select
                    id={`assistant-${proposal.id}-${field}`}
                    className="w-full rounded border bg-background p-2"
                    value={String(
                      Object.hasOwn(values, field)
                        ? (values[field] ?? "")
                        : (input[field] ?? ""),
                    )}
                    onChange={(event) =>
                      setValues((value) => ({
                        ...value,
                        [field]: event.target.value || null,
                      }))
                    }
                  >
                    <option value="">Unassigned</option>
                    {directory.data?.kind === "records" &&
                      directory.data.records.map((record) => (
                        <option key={record.id} value={record.id}>
                          {record.label} ({record.detail})
                        </option>
                      ))}
                  </select>
                ) : field === "notes" || field === "body" ? (
                  <Textarea
                    id={`assistant-${proposal.id}-${field}`}
                    value={String(values[field] ?? input[field] ?? "")}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field]: e.target.value }))
                    }
                  />
                ) : (
                  <Input
                    id={`assistant-${proposal.id}-${field}`}
                    type={
                      field === "defaultFollowUpDelayDays" ? "number" : "text"
                    }
                    value={String(values[field] ?? input[field] ?? "")}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        [field]:
                          field === "defaultFollowUpDelayDays"
                            ? Number(e.target.value)
                            : e.target.value,
                      }))
                    }
                  />
                )}
              </label>
            ))}
            {fields.some((f) => f.endsWith("At")) && (
              <p className="text-xs text-muted-foreground">
                Use an exact date/time with an offset, or YYYY-MM-DDTHH:mm in{" "}
                {Intl.DateTimeFormat().resolvedOptions().timeZone}.
              </p>
            )}
          </form>
        ) : (
          <dl className="space-y-2">
            {Object.entries(input)
              .filter(([key]) => key !== "id" && !key.endsWith("Id"))
              .map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <dt className="text-xs text-muted-foreground">
                    {labels[key] ?? key}
                  </dt>
                  <dd className="whitespace-pre-wrap break-words text-sm">
                    {action.action.endsWith(".update") &&
                      key in before &&
                      before[key] !== value && (
                        <span className="mr-2 text-muted-foreground line-through">
                          {display(before[key], key)}
                        </span>
                      )}
                    {display(value, key)}
                  </dd>
                </div>
              ))}
          </dl>
        )}
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
        {receipt ? (
          <Link
            href={receipt.href}
            className="inline-flex items-center gap-2 font-medium underline"
          >
            <CheckCircle2 className="size-4" />
            Saved — open record
          </Link>
        ) : !handled && !expired ? (
          <div className="flex flex-wrap gap-2">
            {editing ? (
              <>
                <Button
                  size="sm"
                  form={`edit-${proposal.id}`}
                  type="submit"
                  disabled={pending}
                >
                  Save draft changes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => setEditing(false)}
                >
                  Back to review
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={async () => {
                    setError(undefined);
                    try {
                      await confirm.mutateAsync({
                        id: proposal.id,
                        revision: proposal.revision,
                        digest: proposal.digest,
                      });
                      await finish();
                    } catch (e) {
                      setError(
                        e instanceof Error
                          ? e.message
                          : "Could not save this change.",
                      );
                    }
                  }}
                >
                  {confirm.isPending ? "Saving…" : "Confirm"}
                </Button>
                {fields.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => {
                      setValues({ ...input });
                      setEditing(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={async () => {
                    try {
                      await cancel.mutateAsync({
                        id: proposal.id,
                        revision: proposal.revision,
                      });
                      await a.refresh();
                    } catch (e) {
                      setError(
                        e instanceof Error
                          ? e.message
                          : "Could not cancel draft.",
                      );
                    }
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
