"use client";

import { LogEvents } from "@afterservice/events";
import { useTrack } from "@afterservice/events/client";
import { Button, Icons, Input, Label } from "@afterservice/ui";
import { Loader2 } from "lucide-react";
import { type FormEvent, useCallback, useRef, useState } from "react";
import type { QuickFillFormAdapter } from "@/components/dev/quick-fill";
import { signIn } from "@/lib/auth-client";

type FieldValues = {
  name: string;
  email: string;
  password: string;
};

type Props = {
  onSignUp: (values: FieldValues) => Promise<void>;
  adapterRef?: React.MutableRefObject<QuickFillFormAdapter<FieldValues> | null>;
};

export function SignUpForm({ onSignUp, adapterRef }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const track = useTrack();
  const [values, setValues] = useState<FieldValues>({
    name: "",
    email: "",
    password: "",
  });
  const formRef = useRef<HTMLFormElement>(null);

  const setValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value as string }));
  }, []);

  if (adapterRef) {
    adapterRef.current = {
      getValues: () => values,
      reset: (v) => setValues(v as FieldValues),
      setValue,
    };
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    track({
      event: LogEvents.SignUpStarted.name,
      channel: LogEvents.SignUpStarted.channel,
      location: "dashboard_sign_up",
      method: "email",
    });

    try {
      await onSignUp(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed.");
      setIsPending(false);
    }
  }

  async function handleGoogleSignUp() {
    setIsGooglePending(true);
    setError(null);
    track({
      event: LogEvents.SignUpStarted.name,
      channel: LogEvents.SignUpStarted.channel,
      location: "dashboard_sign_up",
      method: "google",
    });
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/onboarding",
        newUserCallbackURL: "/onboarding?signup_method=google",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-up failed.");
      setIsGooglePending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignUp}
          disabled={isGooglePending || isPending}
          className="w-full h-11 relative"
        >
          {isGooglePending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.Google className="mr-2 h-4 w-4" />
          )}
          Sign up with Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sign-up-name">Name</Label>
          <Input
            id="sign-up-name"
            name="name"
            required
            value={values.name}
            onChange={(e) => setValue("name", e.target.value)}
            disabled={isPending || isGooglePending}
            className="h-11"
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sign-up-email">Email</Label>
          <Input
            id="sign-up-email"
            name="email"
            required
            type="email"
            value={values.email}
            onChange={(e) => setValue("email", e.target.value)}
            disabled={isPending || isGooglePending}
            className="h-11"
            placeholder="name@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sign-up-password">Password</Label>
          <Input
            id="sign-up-password"
            minLength={8}
            name="password"
            required
            type="password"
            value={values.password}
            onChange={(e) => setValue("password", e.target.value)}
            disabled={isPending || isGooglePending}
            className="h-11"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button
          disabled={isPending || isGooglePending}
          type="submit"
          className="w-full h-11"
        >
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </div>
  );
}

export type { FieldValues as SignUpFieldValues };
