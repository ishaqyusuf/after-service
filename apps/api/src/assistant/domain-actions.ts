import {
  type AssistantAction,
  type AssistantScope,
  actionSchema,
  amountToCents,
  statedTimeToIso,
} from "@afterservice/assistant";
import {
  AssistantError,
  type Prisma,
  type ProposalSnapshot,
  requireAssistantScope,
} from "@afterservice/db";
import type { ApiContext } from "../context";
import type { DomainRouter } from "../routers/_app";

type Caller = ReturnType<DomainRouter["createCaller"]>;
function plain(value: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value));
}
async function target(
  db: Prisma.TransactionClient,
  scope: AssistantScope,
  kind: ProposalSnapshot[number]["kind"],
  id: string,
) {
  const where = { id, workspaceId: scope.workspaceId };
  const value =
    kind === "customer"
      ? await db.customer.findFirst({ where })
      : kind === "job"
        ? await db.serviceJob.findFirst({ where })
        : kind === "followUp"
          ? await db.followUp.findFirst({
              where,
              include: {
                customer: { select: { name: true } },
                job: { select: { title: true } },
              },
            })
          : kind === "template"
            ? await db.followUpTemplate.findFirst({ where })
            : kind === "member"
              ? await db.membership.findFirst({
                  where,
                  include: { user: { select: { name: true } } },
                })
              : await db.workspace.findFirst({
                  where: { id: scope.workspaceId },
                });
  if (!value)
    throw new AssistantError(
      "NOT_FOUND",
      "The selected record is not available in this workspace.",
    );
  const data = plain(value);
  if (kind === "customer" && data.archivedAt)
    throw new AssistantError("BAD_REQUEST", "Choose an active customer.");
  const before: Record<string, unknown> = {};
  const keys =
    kind === "customer"
      ? ["name", "email", "phone", "companyName", "tags", "notes"]
      : kind === "job"
        ? [
            "title",
            "completedAt",
            "amountCents",
            "currency",
            "serviceCategory",
            "notes",
            "nextFollowUpAt",
            "status",
          ]
        : kind === "followUp"
          ? ["channel", "dueAt", "notes", "status", "templateId", "assigneeId"]
          : kind === "template"
            ? ["name", "channel", "subject", "body", "isDefault"]
            : kind === "workspace"
              ? [
                  "name",
                  "businessType",
                  "serviceCategory",
                  "defaultFollowUpDelayDays",
                ]
              : [];
  for (const key of keys) before[key] = data[key];
  if (
    kind === "followUp" &&
    data.customer &&
    typeof data.customer === "object" &&
    "name" in data.customer
  )
    before.name = String(data.customer.name);
  if (
    kind === "member" &&
    data.user &&
    typeof data.user === "object" &&
    "name" in data.user
  )
    before.name = String(data.user.name);
  if (Array.isArray(before.tags)) before.tags = before.tags.join(", ");
  return {
    kind,
    id: value.id,
    updatedAt: value.updatedAt.toISOString(),
    before,
  };
}
export async function prepareAssistantAction(
  db: Prisma.TransactionClient,
  scope: AssistantScope,
  raw: AssistantAction,
  timeZone: string,
) {
  const enabled = process.env.AFTERSERVICE_ASSISTANT_CAPABILITIES?.split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  if (enabled?.length && !enabled.includes(raw.action))
    throw new AssistantError(
      "FORBIDDEN",
      "This assistant action is not enabled for this workspace.",
    );
  const member = await requireAssistantScope(db, scope);
  if (raw.action === "workspace.update" && member.role === "staff")
    throw new AssistantError("FORBIDDEN", "Owner or admin access is required.");
  const parsed = actionSchema.parse(raw);
  const input: Record<string, unknown> = { ...parsed.input };
  const snapshot: ProposalSnapshot = [];
  const prefix = parsed.action.split(".")[0]!;
  if (prefix === "workspace")
    snapshot.push(await target(db, scope, "workspace", scope.workspaceId));
  else if (typeof input.id === "string")
    snapshot.push(
      await target(
        db,
        scope,
        prefix === "followUp"
          ? "followUp"
          : prefix === "customer"
            ? "customer"
            : prefix === "job"
              ? "job"
              : "template",
        input.id,
      ),
    );
  for (const [field, kind] of [
    ["customerId", "customer"],
    ["jobId", "job"],
    ["templateId", "template"],
    ["assigneeId", "member"],
  ] as const) {
    if (typeof input[field] === "string")
      snapshot.push(await target(db, scope, kind, input[field]));
  }
  if (parsed.action.endsWith(".update")) {
    const before = snapshot[0]!.before;
    const supported = actionSchema.options.find(
      (option) => option.shape.action.value === parsed.action,
    )!.shape.input.shape;
    for (const [key, value] of Object.entries(before))
      if (!(key in input) && (key in supported || key === "amountCents")) {
        if (key === "amountCents") {
          if (typeof value === "number")
            input.amount = (value / 100).toFixed(2);
        } else if (value !== null && value !== undefined) input[key] = value;
      }
  }
  for (const key of ["completedAt", "nextFollowUpAt", "dueAt"]) {
    if (typeof input[key] === "string") {
      try {
        input[key] = statedTimeToIso(input[key], timeZone);
      } catch (error) {
        throw new AssistantError(
          "BAD_REQUEST",
          error instanceof Error
            ? error.message
            : "Provide a valid date and time.",
        );
      }
    }
  }
  if (
    input.amount !== undefined &&
    !input.currency &&
    !(
      parsed.action === "job.update" &&
      amountToCents(String(input.amount)) === snapshot[0]?.before.amountCents
    )
  )
    throw new AssistantError(
      "BAD_REQUEST",
      "Specify the currency for the job amount.",
    );
  if (typeof input.amount === "string") amountToCents(input.amount);
  if (parsed.action === "followUp.logPhone") {
    const followUp = await db.followUp.findFirstOrThrow({
      where: { id: String(input.id), workspaceId: scope.workspaceId },
    });
    if (followUp.channel !== "phone")
      throw new AssistantError(
        "BAD_REQUEST",
        "Phone logging requires a phone follow-up. Use the existing send form for other channels.",
      );
  }
  // Full update payloads preserve omitted values. No model-supplied status may fabricate contact/reply/closure events.
  if (
    parsed.action === "followUp.update" &&
    input.status !== snapshot[0]?.before.status
  )
    throw new AssistantError(
      "BAD_REQUEST",
      "Use the dedicated reply, close, reschedule or phone contact action to change state.",
    );
  const action = actionSchema.parse({ action: parsed.action, input });
  return { action, snapshot };
}
export async function assertProposalTargets(
  db: Prisma.TransactionClient,
  scope: AssistantScope,
  value: Prisma.JsonValue,
) {
  if (!Array.isArray(value))
    throw new AssistantError("BAD_REQUEST", "Invalid saved review.");
  for (const entry of value) {
    if (
      !entry ||
      typeof entry !== "object" ||
      Array.isArray(entry) ||
      typeof entry.id !== "string" ||
      typeof entry.updatedAt !== "string" ||
      !new Set([
        "customer",
        "job",
        "followUp",
        "template",
        "workspace",
        "member",
      ]).has(String(entry.kind))
    )
      throw new AssistantError("BAD_REQUEST", "Invalid saved target.");
    const current = await target(
      db,
      scope,
      entry.kind as ProposalSnapshot[number]["kind"],
      entry.id,
    );
    if (current.updatedAt !== entry.updatedAt)
      throw new AssistantError(
        "CONFLICT",
        "A record changed after this draft was prepared. Create a fresh draft.",
      );
  }
}
export async function executeAssistantAction(
  caller: Caller,
  action: AssistantAction,
) {
  switch (action.action) {
    case "customer.create":
      return caller.customers.create(action.input);
    case "customer.update":
      return caller.customers.update({
        ...action.input,
        name: action.input.name!,
      });
    case "customer.archive":
      return caller.customers.archive(action.input);
    case "job.create": {
      const { amount, currency, ...input } = action.input;
      return caller.serviceJobs.create({
        ...input,
        currency,
        completedAt: new Date(input.completedAt),
        nextFollowUpAt: input.nextFollowUpAt
          ? new Date(input.nextFollowUpAt)
          : undefined,
        amountCents: amount === undefined ? undefined : amountToCents(amount),
      });
    }
    case "job.update": {
      const { amount, currency, ...input } = action.input;
      return caller.serviceJobs.update({
        ...input,
        currency,
        title: input.title!,
        completedAt: new Date(input.completedAt!),
        nextFollowUpAt: input.nextFollowUpAt
          ? new Date(input.nextFollowUpAt)
          : undefined,
        status: input.status ?? "completed",
        amountCents: amount === undefined ? undefined : amountToCents(amount),
      });
    }
    case "job.complete":
      return caller.serviceJobs.markCompleted(action.input);
    case "job.followUp":
      return caller.serviceJobs.createFollowUp({
        ...action.input,
        dueAt: new Date(action.input.dueAt),
      });
    case "followUp.create":
      return caller.followUps.create({
        ...action.input,
        dueAt: new Date(action.input.dueAt),
      });
    case "followUp.update":
      return caller.followUps.update({
        ...action.input,
        channel: action.input.channel!,
        dueAt: new Date(action.input.dueAt!),
        status: action.input.status!,
      });
    case "followUp.reschedule":
      return caller.followUps.reschedule({
        ...action.input,
        dueAt: new Date(action.input.dueAt),
      });
    case "followUp.assign":
      return caller.followUps.assignOwner(action.input);
    case "followUp.logPhone":
      return caller.followUps.markSent(action.input);
    case "followUp.reply":
      return caller.followUps.markReplied(action.input);
    case "followUp.close":
      return caller.followUps.close(action.input);
    case "template.create":
      return caller.templates.create(action.input);
    case "template.update":
      return caller.templates.update({
        ...action.input,
        name: action.input.name!,
        body: action.input.body!,
        channel: action.input.channel!,
        isDefault: action.input.isDefault ?? false,
      });
    case "template.archive":
      return caller.templates.archive(action.input);
    case "template.default":
      return caller.templates.setDefault(action.input);
    case "workspace.update":
      return caller.workspace.updateSettings({
        ...action.input,
        name: action.input.name!,
        defaultFollowUpDelayDays: action.input.defaultFollowUpDelayDays!,
      });
  }
}
export function operationHref(action: AssistantAction, recordId: string) {
  if (action.action === "customer.archive") return "/customers";
  if (action.action.startsWith("customer."))
    return `/customers?customerId=${recordId}&editCustomer=true`;
  if (action.action.startsWith("template."))
    return action.action === "template.archive"
      ? "/templates"
      : `/templates?templateId=${recordId}`;
  if (action.action.startsWith("followUp.") || action.action === "job.followUp")
    return `/follow-ups?followUpId=${recordId}`;
  return action.action.startsWith("job.") ? "/jobs" : "/settings";
}
export type DomainCallerFactory = (context: ApiContext) => Caller;
