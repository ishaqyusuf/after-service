"use client";

import { Button, Input } from "@afterservice/ui";
import { useState } from "react";
import { getApiBaseUrl } from "./api-url";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const nameId = `${mode}-name`;
  const emailId = `${mode}-email`;
  const passwordId = `${mode}-password`;

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);

    const apiBaseUrl = getApiBaseUrl();
    const endpoint =
      mode === "sign-up"
        ? "/api/auth/sign-up/email"
        : "/api/auth/sign-in/email";
    const body =
      mode === "sign-up"
        ? {
            callbackURL: "/onboarding",
            email: String(formData.get("email") ?? ""),
            name: String(formData.get("name") ?? ""),
            password: String(formData.get("password") ?? ""),
          }
        : {
            callbackURL: "/",
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          };

    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      body: JSON.stringify(body),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setError(payload?.message ?? "Authentication failed.");
      setIsPending(false);
      return;
    }

    window.location.href = mode === "sign-up" ? "/onboarding" : "/";
  }

  return (
    <form action={handleSubmit} className="dashboard-form">
      {mode === "sign-up" ? (
        <label htmlFor={nameId}>
          Name
          <Input id={nameId} name="name" required />
        </label>
      ) : null}
      <label htmlFor={emailId}>
        Email
        <Input id={emailId} name="email" required type="email" />
      </label>
      <label htmlFor={passwordId}>
        Password
        <Input
          id={passwordId}
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
      {error ? <p className="dashboard-form__error">{error}</p> : null}
      <Button disabled={isPending} type="submit">
        {isPending
          ? "Working..."
          : mode === "sign-up"
            ? "Create account"
            : "Sign in"}
      </Button>
    </form>
  );
}
