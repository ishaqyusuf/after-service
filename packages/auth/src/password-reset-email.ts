import { resolveEmailRecipients } from "@afterservice/utils";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

export async function sendPasswordResetEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  const [route] = resolveEmailRecipients(email).routes;
  if (!route) throw new Error("At least one email recipient is required.");
  if (route.transport === "console") {
    // Reset tokens grant account access; never include them in application logs.
    console.info(
      "[PASSWORD RESET] Provider delivery disabled in console mode.",
    );
    return;
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey)
    throw new Error("RESEND_API_KEY is required for provider delivery.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(15_000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:
        process.env.EMAIL_FROM_ADDRESS?.trim() || "noreply@afterservice.app",
      to: [route.recipient],
      subject: route.qaRouted
        ? `[QA: ${route.originalRecipient}] Reset your password`
        : "Reset your password",
      headers: route.qaRouted
        ? { "X-QA-Original-Recipient": route.originalRecipient }
        : undefined,
      html: `${route.qaRouted ? `<p><strong>QA routed for ${escapeHtml(route.originalRecipient)}</strong></p>` : ""}<p>Reset your afterservice password using the link below. This link expires in one hour and can be used once.</p><p><a href="${escapeHtml(url)}">Reset your password</a></p><p>If you didn't request this, you can ignore this email.</p>`,
    }),
  });

  if (!response.ok) {
    // Provider bodies can contain personal data; keep the failure safe to log.
    throw new Error(
      `Password reset email delivery failed (${response.status}).`,
    );
  }
}
