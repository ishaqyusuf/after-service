"use client";

import { Button, Input, Label } from "@afterservice/ui";
import { type FormEvent, useState, useEffect } from "react";

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsPending(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message || "Failed to reset password.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setIsPending(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-md bg-green-500/10 p-4">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Your password has been successfully reset.
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
        <Label htmlFor="reset-password-new">New Password</Label>
        <Input
          id="reset-password-new"
          name="password"
          required
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reset-password-confirm">Confirm New Password</Label>
        <Input
          id="reset-password-confirm"
          name="confirmPassword"
          required
          type="password"
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isPending}
          className="h-11"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button disabled={isPending} type="submit" className="w-full h-11">
        {isPending ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}
