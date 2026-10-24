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
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useZodForm } from "@/hooks/use-zod-form";
import { authClient } from "@/lib/auth-client";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be at most 128 characters."),
    confirmPassword: z.string().min(8, "Confirm your new password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm({ token }: { token?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidToken, setInvalidToken] = useState(!token);
  const form = useZodForm({
    schema: resetPasswordSchema,
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function handleSubmit(data: z.infer<typeof resetPasswordSchema>) {
    setError(null);

    try {
      if (!token) return;
      const result = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (result.error) {
        if (result.error.code === "INVALID_TOKEN") {
          setInvalidToken(true);
          form.reset();
          return;
        }
        throw new Error("Unable to reset your password. Please try again.");
      }

      // A full navigation lets password managers observe a successful submit
      // and removes the one-use token without remounting an invalid reset form.
      window.location.replace("/sign-in?password_reset=success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reset password.",
      );
    }
  }

  if (invalidToken) {
    return (
      <div className="space-y-4 text-center">
        <p role="alert" className="text-sm text-muted-foreground">
          This reset link is invalid or has expired. Request a new link to reset
          your password.
        </p>
        <Button asChild className="h-11 w-full">
          <a href="/forgot-password">Request a new reset link</a>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        method="post"
        autoComplete="on"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    disabled={form.formState.isSubmitting}
                    className="h-11 pr-11"
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11 text-foreground/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  aria-label={
                    showPassword ? "Hide new password" : "Show new password"
                  }
                  aria-pressed={showPassword}
                  disabled={form.formState.isSubmitting}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    {...field}
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    disabled={form.formState.isSubmitting}
                    className="h-11 pr-11"
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11 text-foreground/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password confirmation"
                      : "Show password confirmation"
                  }
                  aria-pressed={showConfirmPassword}
                  disabled={form.formState.isSubmitting}
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
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
          {form.formState.isSubmitting ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </Form>
  );
}
