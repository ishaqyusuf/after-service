"use client";

import {
  Button,
  Input,
  Label,
  Icons
} from "@afterservice/ui";
import { Loader2 } from "lucide-react";
import { type FormEvent, useCallback, useRef, useState } from "react";
import { signIn } from "@/lib/auth-client";

type FieldValues = {
  email: string;
  password: string;
};

type Props = {
  onSignIn: (values: FieldValues) => Promise<void>;
  returnTo?: string | null;
  adapterRef?: React.MutableRefObject<QuickFillFormAdapter<FieldValues> | null>;
};

// inline to avoid extra file
type QuickFillFormAdapter<TValues extends Record<string, unknown>> = {
  getValues: () => TValues;
  reset: (values: TValues) => void;
  setValue: (name: string, value: unknown) => void;
};

export function SignInForm({ onSignIn, returnTo, adapterRef }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [values, setValues] = useState<FieldValues>({
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

    try {
      await onSignIn(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setIsPending(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGooglePending(true);
    setError(null);
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: returnTo || "/",
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Google sign-in failed.");
      }

      if (result.data?.url) {
        window.location.href = result.data.url;
        return;
      }

      setIsGooglePending(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setIsGooglePending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleGoogleSignIn}
          disabled={isGooglePending || isPending}
          className="w-full h-11 relative"
        >
          {isGooglePending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.Google className="mr-2 h-4 w-4" />
          )}
          Continue with Google
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
        {returnTo && returnTo !== "/" ? (
          <p className="text-sm text-muted-foreground text-center">
            You&apos;ll be redirected to <strong>{returnTo}</strong> after
            sign-in.
          </p>
        ) : null}
        
        <div className="space-y-2">
          <Label htmlFor="sign-in-email">Email</Label>
          <Input
            id="sign-in-email"
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
          <div className="flex items-center justify-between">
            <Label htmlFor="sign-in-password">Password</Label>
            <a href="/forgot-password" className="text-sm font-medium text-primary hover:underline underline-offset-4">
              Forgot password?
            </a>
          </div>
          <Input
            id="sign-in-password"
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
        
        <Button disabled={isPending || isGooglePending} type="submit" className="w-full h-11">
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

export type { FieldValues as SignInFieldValues };
