import { resolveEmailRecipients } from "@afterservice/utils";
import type { EmailInput } from "../base";

type EmailSendResult = {
  error?: unknown;
  originalRecipients: string[];
  providerId?: string;
  recipients: string[];
  status: "sent" | "failed" | "skipped";
  wasRecipientOverridden: boolean;
};

function readNonEmptyEnv(key: string) {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function textToHtml(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

function emailBodyFromInput(email: EmailInput) {
  const body = email.data.body;

  if (typeof body === "string" && body.trim()) {
    return textToHtml(body);
  }

  return `<pre>${escapeHtml(JSON.stringify(email.data, null, 2))}</pre>`;
}

export class EmailService {
  async send(email: EmailInput): Promise<EmailSendResult> {
    const apiKey = readNonEmptyEnv("RESEND_API_KEY");
    const from = email.from || readNonEmptyEnv("EMAIL_FROM_ADDRESS");
    const recipients = resolveEmailRecipients(email.user.email);

    if (!from || recipients.recipients.length === 0) {
      return {
        originalRecipients: recipients.originalRecipients,
        recipients: recipients.recipients,
        status: "skipped",
        wasRecipientOverridden: recipients.isOverridden,
      };
    }

    let providerId: string | undefined;
    try {
      for (const route of recipients.routes) {
        if (route.transport === "console") {
          console.info("[email:console]", {
            recipient: route.originalRecipient,
            subject: email.subject,
          });
          continue;
        }
        if (!apiKey)
          throw new Error("RESEND_API_KEY is required for provider delivery.");
        const response = await fetch("https://api.resend.com/emails", {
          body: JSON.stringify({
            from,
            headers: route.qaRouted
              ? { "X-QA-Original-Recipient": route.originalRecipient }
              : undefined,
            html: route.qaRouted
              ? `<p><strong>QA routed for ${route.originalRecipient}</strong></p>${emailBodyFromInput(email)}`
              : emailBodyFromInput(email),
            subject: route.qaRouted
              ? `[QA: ${route.originalRecipient}] ${email.subject}`
              : email.subject,
            to: [route.recipient],
          }),
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const payload = (await response.json().catch(() => null)) as {
          error?: unknown;
          id?: string;
        } | null;

        if (!response.ok || payload?.error) {
          throw payload?.error ?? new Error(response.statusText);
        }
        providerId = payload?.id ?? providerId;
      }

      return {
        originalRecipients: recipients.originalRecipients,
        providerId,
        recipients: recipients.recipients,
        status: recipients.routes.some(
          (route) => route.transport === "provider",
        )
          ? "sent"
          : "skipped",
        wasRecipientOverridden: recipients.isOverridden,
      };
    } catch (error) {
      return {
        error,
        originalRecipients: recipients.originalRecipients,
        recipients: recipients.recipients,
        status: "failed",
        wasRecipientOverridden: recipients.isOverridden,
      };
    }
  }
}
