"use client";

import { LogEvents } from "@afterservice/events";
import { useTrack } from "@afterservice/events/client";
import { AuthFooter, AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

type SignUpValues = { name: string; email: string; password: string };

export function SignUpView() {
  const track = useTrack();

  async function handleSignUp(values: SignUpValues) {
    const response = await fetch("/api/auth/sign-up/email", {
      body: JSON.stringify({
        callbackURL: "/onboarding",
        email: values.email,
        name: values.name,
        password: values.password,
      }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(payload?.message ?? "Sign-up failed.");
    }

    track({
      event: LogEvents.SignUpCompleted.name,
      channel: LogEvents.SignUpCompleted.channel,
      location: "dashboard_sign_up",
      method: "email",
    });

    window.location.href = "/onboarding";
  }

  return (
    <AuthShell
      description="Create an owner account, then set up the workspace."
      footer={
        <AuthFooter>
          Already have an account? <a href="/sign-in">Sign in</a>
        </AuthFooter>
      }
      title="Create your account"
    >
      <SignUpForm onSignUp={handleSignUp} />
    </AuthShell>
  );
}
