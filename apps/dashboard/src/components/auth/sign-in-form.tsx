"use client";

import {
  Button,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Input,
} from "@afterservice/ui";
import { type FormEvent, useCallback, useRef, useState } from "react";

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

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="auth-form">
      <FieldGroup>
        {returnTo && returnTo !== "/" ? (
          <FieldDescription>
            You'll be redirected to <strong>{returnTo}</strong> after sign-in.
          </FieldDescription>
        ) : null}
        <Field>
          <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
          <Input
            id="sign-in-email"
            name="email"
            required
            type="email"
            value={values.email}
            onChange={(e) => setValue("email", e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
          <Input
            id="sign-in-password"
            minLength={8}
            name="password"
            required
            type="password"
            value={values.password}
            onChange={(e) => setValue("password", e.target.value)}
          />
        </Field>
      </FieldGroup>
      {error ? <p className="auth-form__error">{error}</p> : null}
      <Button disabled={isPending} type="submit">
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

export type { FieldValues as SignInFieldValues };
