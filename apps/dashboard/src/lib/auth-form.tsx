"use client";

import { Button, Field, FieldGroup, FieldLabel, Input } from "@afterservice/ui";
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
    const returnTo = getReturnTo();
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
            callbackURL: returnTo,
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

    window.location.href = mode === "sign-up" ? "/onboarding" : returnTo;
  }

  return (
    <form action={handleSubmit} className="dashboard-form">
      <FieldGroup>
        {mode === "sign-up" ? (
          <Field>
            <FieldLabel htmlFor={nameId}>Name</FieldLabel>
            <Input id={nameId} name="name" required />
          </Field>
        ) : null}
        <Field>
          <FieldLabel htmlFor={emailId}>Email</FieldLabel>
          <Input id={emailId} name="email" required type="email" />
        </Field>
        <Field>
          <FieldLabel htmlFor={passwordId}>Password</FieldLabel>
          <Input
            id={passwordId}
            minLength={8}
            name="password"
            required
            type="password"
          />
        </Field>
      </FieldGroup>
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

function getReturnTo() {
  const returnTo = new URLSearchParams(window.location.search).get("return_to");

  if (!returnTo?.startsWith("/")) {
    return "/";
  }

  return returnTo;
}
