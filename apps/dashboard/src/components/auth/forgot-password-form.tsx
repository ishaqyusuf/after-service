"use client";

import { Button, Input, Label } from "@afterservice/ui";
import { type FormEvent, useState } from "react";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo: "/reset-password" }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message || "Failed to send reset email.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email.");
    } finally {
      setIsPending(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-md bg-green-500/10 p-4">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Check your email for a link to reset your password. If it doesn&apos;t appear within a few minutes, check your spam folder.
          </p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => window.location.href = "/sign-in"}>
          Return to log in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="forgot-password-email">Email</Label>
        <Input
          id="forgot-password-email"
          name="email"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          className="h-11"
          placeholder="name@example.com"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button disabled={isPending} type="submit" className="w-full h-11">
        {isPending ? "Sending reset link..." : "Send reset link"}
      </Button>
    </form>
  );
}
