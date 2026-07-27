export type EmailRecipientResolution = {
  isOverridden: boolean;
  originalRecipients: string[];
  recipients: string[];
  routes: EmailDeliveryRoute[];
};

export type EmailDeliveryRoute = {
  originalRecipient: string;
  recipient: string;
  transport: "console" | "provider";
  qaRouted: boolean;
};

function readNonEmptyEnv(env: Record<string, string | undefined>, key: string) {
  const value = env[key]?.trim();
  return value ? value : undefined;
}

export function isDevelopmentEmailMode(
  env: Record<string, string | undefined> = process.env,
) {
  const mode = readNonEmptyEnv(env, "AFTERSERVICE_ENV_MODE");

  if (mode) {
    return mode !== "production";
  }

  return env.NODE_ENV !== "production";
}

export function resolveEmailRecipients(
  recipients: string | string[],
  env: Record<string, string | undefined> = process.env,
): EmailRecipientResolution {
  const originalRecipients = (
    Array.isArray(recipients) ? recipients : [recipients]
  )
    .map((recipient) => recipient.trim())
    .filter(Boolean);
  const deliveryMode = readNonEmptyEnv(env, "EMAIL_DELIVERY_MODE");
  if (deliveryMode && deliveryMode !== "console" && deliveryMode !== "live") {
    throw new Error("EMAIL_DELIVERY_MODE must be console or live.");
  }
  const mode =
    deliveryMode ?? (isDevelopmentEmailMode(env) ? "console" : "live");
  const configured = readNonEmptyEnv(env, "EMAIL_QA_DOMAIN_ROUTES");
  let qaRoutes: Record<string, string> = {};
  if (configured) {
    try {
      qaRoutes = JSON.parse(configured) as Record<string, string>;
    } catch {
      throw new Error("EMAIL_QA_DOMAIN_ROUTES must be valid JSON.");
    }
  }
  const normalizedRoutes = new Map(
    Object.entries(qaRoutes).map(([domain, destination]) => [
      domain.trim().toLowerCase().replace(/^\.+/, ""),
      destination.trim(),
    ]),
  );
  const routes = originalRecipients.map((originalRecipient) => {
    const domain =
      originalRecipient.trim().toLowerCase().split("@").at(-1) ?? "";
    const recipient = normalizedRoutes.get(domain);
    if (recipient) {
      return {
        originalRecipient,
        recipient,
        transport: "provider" as const,
        qaRouted: true,
      };
    }
    if (domain.endsWith(".test")) {
      throw new Error(`No QA email route is configured for ${domain}.`);
    }
    return {
      originalRecipient,
      recipient: originalRecipient,
      transport: mode === "live" ? ("provider" as const) : ("console" as const),
      qaRouted: false,
    };
  });

  return {
    isOverridden: routes.some((route) => route.qaRouted),
    originalRecipients,
    recipients: routes.map((route) => route.recipient),
    routes,
  };
}

export function getQaDomainForEmail(
  email: string,
  env: Record<string, string | undefined> = process.env,
) {
  const resolution = resolveEmailRecipients(email, {
    ...env,
    EMAIL_DELIVERY_MODE: "console",
  });
  return resolution.routes[0]?.qaRouted
    ? (email.trim().toLowerCase().split("@").at(-1) ?? null)
    : null;
}
