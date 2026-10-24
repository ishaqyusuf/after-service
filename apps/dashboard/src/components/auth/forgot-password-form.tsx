"use client";

import { Button, Input } from "@afterservice/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@afterservice/ui/form";
import { useState } from "react";
import { z } from "zod";
import { useZodForm } from "@/hooks/use-zod-form";
import { authClient } from "@/lib/auth-client";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const form = useZodForm({
    schema: forgotPasswordSchema,
    defaultValues: {
      email: "",
    },
  });

  async function handleSubmit(data: z.infer<typeof forgotPasswordSchema>) {
    setError(null);
    setSuccess(false);

    try {
      const result = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: new URL(
          "/reset-password",
          window.location.origin,
        ).toString(),
      });

      if (result.error) {
        throw new Error("Unable to send a reset link. Please try again.");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset email.",
      );
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-md bg-green-500/10 p-4">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            If an account exists for that email, you&apos;ll receive a password
            reset link. Check your inbox and spam folder.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            window.location.href = "/sign-in";
          }}
        >
          Return to log in
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  disabled={form.formState.isSubmitting}
                  className="h-11"
                  placeholder="name@example.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="h-11 w-full"
        >
          {form.formState.isSubmitting
            ? "Sending reset link..."
            : "Send reset link"}
        </Button>
      </form>
    </Form>
  );
}
