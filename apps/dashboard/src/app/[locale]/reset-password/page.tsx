import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password | afterservice",
  description: "Set a new password for your afterservice dashboard account.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  const validLink = typeof token === "string" && token.length > 0 && !error;
  return (
    <AuthShell
      description={
        validLink
          ? "Please enter your new password below."
          : "Request a fresh link to recover your account."
      }
      title={validLink ? "Set new password" : "Reset your password"}
    >
      <ResetPasswordForm token={validLink ? token : undefined} />
    </AuthShell>
  );
}
