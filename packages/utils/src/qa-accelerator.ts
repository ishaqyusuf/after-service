export const QA_ACCELERATOR_CONTRACT_VERSION = 1 as const;

export type QaAcceleratorEnvironment =
  | "local"
  | "development"
  | "preview"
  | "production";

export type QaAcceleratorAvailability =
  | {
      available: true;
      contractVersion: typeof QA_ACCELERATOR_CONTRACT_VERSION;
      environment: Exclude<QaAcceleratorEnvironment, "production">;
      platform: "web";
    }
  | {
      available: false;
      category:
        | "environment_not_allowed"
        | "misconfigured"
        | "origin_not_allowed"
        | "upgrade_required";
      contractVersion: typeof QA_ACCELERATOR_CONTRACT_VERSION;
      environment: QaAcceleratorEnvironment;
      platform: "web";
    };

type QaEnvironment = Record<string, string | undefined>;

function normalizeEnvironment(env: QaEnvironment): QaAcceleratorEnvironment {
  const configured = env.AFTERSERVICE_ENV_MODE?.trim().toLowerCase();

  if (configured === "prod" || configured === "production") {
    return "production";
  }
  if (configured === "preview") {
    return "preview";
  }
  if (configured === "dev" || configured === "development") {
    return "development";
  }
  if (configured === "local") {
    return "local";
  }

  return env.NODE_ENV === "production" ? "production" : "development";
}

function normalizeQaDomain(domain: string) {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^\.+|\.+$/g, "");
}

function readQaRoutes(env: QaEnvironment) {
  const source = env.EMAIL_QA_DOMAIN_ROUTES?.trim();
  if (!source) {
    return new Map<string, string>();
  }

  try {
    const parsed = JSON.parse(source) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return new Map<string, string>();
    }

    return new Map(
      Object.entries(parsed)
        .filter(
          (entry): entry is [string, string] =>
            typeof entry[1] === "string" && entry[1].trim().length > 0,
        )
        .map(([domain, destination]): [string, string] => [
          normalizeQaDomain(domain),
          destination.trim(),
        ])
        .filter(([domain]) => domain.endsWith(".test")),
    );
  } catch {
    return new Map<string, string>();
  }
}

function readAllowedOrigins(env: QaEnvironment) {
  return new Set(
    env.QA_ACCELERATOR_ALLOWED_ORIGINS?.split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .flatMap((value) => {
        try {
          return [new URL(value).origin];
        } catch {
          return [];
        }
      }) ?? [],
  );
}

export function isConfiguredQaDomain(domain: string, env: QaEnvironment) {
  return readQaRoutes(env).has(normalizeQaDomain(domain));
}

export function assertQaAcceleratorStartupSafety(env: QaEnvironment) {
  if (
    normalizeEnvironment(env) === "production" &&
    env.QA_ACCELERATOR_ENABLED?.trim().toLowerCase() === "true"
  ) {
    throw new Error("The QA accelerator cannot be enabled in production.");
  }
}

export function getQaAcceleratorAvailability(input: {
  clientContractVersion: number;
  env: QaEnvironment;
  origin?: string;
  platform: "web";
}): QaAcceleratorAvailability {
  const environment = normalizeEnvironment(input.env);
  const base = {
    contractVersion: QA_ACCELERATOR_CONTRACT_VERSION,
    environment,
    platform: input.platform,
  } as const;

  if (environment === "production") {
    return { ...base, available: false, category: "environment_not_allowed" };
  }

  if (input.clientContractVersion !== QA_ACCELERATOR_CONTRACT_VERSION) {
    return { ...base, available: false, category: "upgrade_required" };
  }

  const secret = input.env.QA_ACCELERATOR_SECRET?.trim() ?? "";
  const enabled =
    input.env.QA_ACCELERATOR_ENABLED?.trim().toLowerCase() === "true";
  const allowedOrigins = readAllowedOrigins(input.env);
  if (
    !enabled ||
    secret.length < 32 ||
    readQaRoutes(input.env).size === 0 ||
    allowedOrigins.size === 0
  ) {
    return { ...base, available: false, category: "misconfigured" };
  }

  let requestOrigin: string | null = null;
  try {
    requestOrigin = input.origin ? new URL(input.origin).origin : null;
  } catch {
    requestOrigin = null;
  }
  if (!requestOrigin || !allowedOrigins.has(requestOrigin)) {
    return { ...base, available: false, category: "origin_not_allowed" };
  }

  return {
    ...base,
    available: true,
    environment,
  };
}

export type QaExternalEffect =
  | "email"
  | "sms"
  | "phone"
  | "whatsapp"
  | "payment"
  | "subscription"
  | "destructive";

export function resolveQaExternalEffectPolicy(input: {
  effect: QaExternalEffect;
  isQaWorkspace: boolean;
  isRoutedQaEmail?: boolean;
  hasRegisteredQaAdapter?: boolean;
}) {
  if (!input.isQaWorkspace) {
    return { allowed: true, reason: "ordinary_workspace" } as const;
  }
  if (input.effect === "email" && input.isRoutedQaEmail) {
    return { allowed: true, reason: "routed_qa_email" } as const;
  }
  if (input.hasRegisteredQaAdapter) {
    return { allowed: true, reason: "registered_qa_adapter" } as const;
  }
  return { allowed: false, reason: "qa_effect_blocked" } as const;
}

function stableHash(value: string) {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

export function createQaCustomerFixture(input: {
  invocation: number;
  qaDomain: string;
  seed: string;
}) {
  const qaDomain = normalizeQaDomain(input.qaDomain);
  if (!qaDomain.endsWith(".test")) {
    throw new Error("QA customer fixtures require a .test QA domain.");
  }

  const invocation = Math.max(0, Math.trunc(input.invocation));
  const identifier = stableHash(`${input.seed}:${invocation}:${qaDomain}`)
    .toString(36)
    .padStart(7, "0")
    .slice(0, 7);
  const phoneSuffix = String(
    stableHash(`${identifier}:phone`) % 10_000,
  ).padStart(4, "0");

  return {
    name: `QA Customer ${identifier.toUpperCase()}`,
    email: `qa.customer.${identifier}@${qaDomain}`,
    phone: `+2340000${phoneSuffix}`,
    companyName: `QA Company ${identifier.toUpperCase()}`,
    tags: ["qa", "quick-fill"],
    notes: `Deterministic QA fixture ${identifier}. Safe to purge.`,
  };
}

export type QaFormCoverageEntry = {
  formId: string;
  status: "recipe" | "excluded" | "prerequisite";
  reason?: string;
};

export const afterserviceQaFormInventory = [
  "auth.sign-in",
  "auth.sign-up-identity",
  "auth.password",
  "auth.forgot-password",
  "auth.reset-password",
  "onboarding.workspace",
  "customer.create",
  "customer.edit",
  "customer.search",
  "job.create",
  "job.search",
  "follow-up.create",
  "follow-up.schedule",
  "follow-up.reschedule",
  "follow-up.message-draft",
  "follow-up.reply-note",
  "follow-up.close",
  "follow-up.search",
  "template.create",
  "template.edit",
  "template.archive",
  "template.search",
  "workspace.settings",
  "billing.checkout",
  "billing.portal",
  "qa.authorization",
  "qa.purge-confirmation",
] as const;

export const afterserviceQaFormCoverage = [
  {
    formId: "auth.sign-in",
    status: "excluded",
    reason:
      "The profile chooser creates an ordinary session without filling credentials.",
  },
  { formId: "auth.sign-up-identity", status: "recipe" },
  {
    formId: "auth.password",
    status: "excluded",
    reason: "Credentials are never generated or overwritten by Quick Fill.",
  },
  {
    formId: "auth.forgot-password",
    status: "excluded",
    reason: "Recovery identifiers and reset effects stay manual.",
  },
  {
    formId: "auth.reset-password",
    status: "excluded",
    reason: "Reset tokens and new passwords stay manual.",
  },
  { formId: "onboarding.workspace", status: "recipe" },
  { formId: "customer.create", status: "recipe" },
  { formId: "customer.edit", status: "recipe" },
  {
    formId: "customer.search",
    status: "excluded",
    reason: "Search criteria should be selected from current QA data.",
  },
  {
    formId: "job.create",
    status: "prerequisite",
    reason: "Requires an existing customer in the selected workspace.",
  },
  {
    formId: "job.search",
    status: "excluded",
    reason: "Search criteria should be selected from current QA data.",
  },
  { formId: "follow-up.create", status: "recipe" },
  { formId: "follow-up.schedule", status: "recipe" },
  { formId: "follow-up.reschedule", status: "recipe" },
  { formId: "follow-up.message-draft", status: "recipe" },
  { formId: "follow-up.reply-note", status: "recipe" },
  {
    formId: "follow-up.close",
    status: "excluded",
    reason: "Closure remains an explicit operator action.",
  },
  {
    formId: "follow-up.search",
    status: "excluded",
    reason: "Search criteria should be selected from current QA data.",
  },
  { formId: "template.create", status: "recipe" },
  { formId: "template.edit", status: "recipe" },
  {
    formId: "template.archive",
    status: "excluded",
    reason: "Archive actions remain explicit and are never Quick Filled.",
  },
  {
    formId: "template.search",
    status: "excluded",
    reason: "Search criteria should be selected from current QA data.",
  },
  { formId: "workspace.settings", status: "recipe" },
  {
    formId: "billing.checkout",
    status: "excluded",
    reason: "QA workspaces cannot create payment or subscription effects.",
  },
  {
    formId: "billing.portal",
    status: "excluded",
    reason: "QA workspaces cannot create subscription-provider sessions.",
  },
  {
    formId: "qa.authorization",
    status: "excluded",
    reason: "QA domains and tester credentials are always entered manually.",
  },
  {
    formId: "qa.purge-confirmation",
    status: "excluded",
    reason: "Destructive confirmation values must be entered manually.",
  },
] as const satisfies readonly QaFormCoverageEntry[];

export function assertCompleteQaFormCoverage(input: {
  coverage: readonly QaFormCoverageEntry[];
  formIds: readonly string[];
}) {
  const expected = new Set(input.formIds);
  const counts = new Map<string, number>();
  for (const entry of input.coverage) {
    counts.set(entry.formId, (counts.get(entry.formId) ?? 0) + 1);
  }

  const missing = [...expected].filter((formId) => !counts.has(formId));
  const duplicates = [...counts.entries()]
    .filter(([, count]) => count !== 1)
    .map(([formId]) => formId);
  const unexpected = [...counts.keys()].filter(
    (formId) => !expected.has(formId),
  );

  if (missing.length || duplicates.length || unexpected.length) {
    const details = [
      missing.length ? `Missing: ${missing.sort().join(", ")}` : null,
      duplicates.length ? `Duplicates: ${duplicates.sort().join(", ")}` : null,
      unexpected.length ? `Unexpected: ${unexpected.sort().join(", ")}` : null,
    ].filter(Boolean);
    throw new Error(`Incomplete QA form coverage. ${details.join(". ")}`);
  }
}
