"use client";

import { Button, Input, Label } from "@afterservice/ui";
import { type FormEvent, useCallback, useRef, useState } from "react";
import type { QuickFillFormAdapter } from "@/components/dev/quick-fill";

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

    try {
      await onSignUp(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed.");
      setIsPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="auth-form">
      <div className="auth-form__field">
        <Label htmlFor="sign-up-name">Name</Label>
        <Input
          id="sign-up-name"
          name="name"
          required
          value={values.name}
          onChange={(e) => setValue("name", e.target.value)}
        />
      </div>
      <div className="auth-form__field">
        <Label htmlFor="sign-up-email">Email</Label>
        <Input
          id="sign-up-email"
          name="email"
          required
          type="email"
          value={values.email}
          onChange={(e) => setValue("email", e.target.value)}
        />
      </div>
      <div className="auth-form__field">
        <Label htmlFor="sign-up-password">Password</Label>
        <Input
          id="sign-up-password"
          minLength={8}
          name="password"
          required
          type="password"
          value={values.password}
          onChange={(e) => setValue("password", e.target.value)}
        />
      </div>
      {error ? <p className="auth-form__error">{error}</p> : null}
      <Button disabled={isPending} type="submit">
        {isPending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}

export type { FieldValues as SignUpFieldValues };
