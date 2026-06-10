"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { AuthFooter, AuthShell } from "@/components/auth/auth-shell";
import {
  type SignInFieldValues,
  SignInForm,
} from "@/components/auth/sign-in-form";

const DevLoginFab = dynamic(
  () =>
    import("@/components/dev/dev-login-fab").then((mod) => ({
      default: mod.DevLoginFab,
    })),
  { ssr: false },
);

type SignInValues = SignInFieldValues;
type SignInAdapter = React.MutableRefObject<{
  getValues: () => SignInValues;
  reset: (values: SignInValues) => void;
  setValue: (name: string, value: unknown) => void;
} | null>;

export function SignInView() {
  const adapterRef = useRef<SignInAdapter["current"]>(null);
  const [returnTo, setReturnTo] = useState("/");

  useEffect(() => {
    setReturnTo(getReturnTo());
  }, []);

  async function handleSignIn(values: SignInValues) {
    const response = await fetch("/api/auth/sign-in/email", {
      body: JSON.stringify({
        callbackURL: returnTo,
        email: values.email,
        password: values.password,
      }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(payload?.message ?? "Sign-in failed.");
    }

    window.location.href = returnTo;
  }

  return (
    <AuthShell
      description="Use your operator account to access the dashboard."
      footer={
        <AuthFooter>
          Don&apos;t have an account? <a href="/sign-up">Sign up</a>
        </AuthFooter>
      }
      title="Sign in"
    >
      <SignInForm
        onSignIn={handleSignIn}
        returnTo={returnTo}
        adapterRef={adapterRef}
      />
      {process.env.NODE_ENV !== "production" && (
        <DevLoginFab
          onFill={(account: { email: string; password: string }) => {
            adapterRef.current?.reset({
              email: account.email,
              password: account.password,
            });
          }}
          onSignIn={(account: { email: string; password: string }) => {
            handleSignIn({
              email: account.email,
              password: account.password,
            }).catch(() => {
              adapterRef.current?.reset({
                email: account.email,
                password: account.password,
              });
            });
          }}
        />
      )}
    </AuthShell>
  );
}

function getReturnTo() {
  if (typeof window === "undefined") return "/";
  const returnTo = new URLSearchParams(window.location.search).get("return_to");
  if (!returnTo?.startsWith("/")) return "/";
  if (returnTo.startsWith("//")) return "/";
  return returnTo;
}
