"use client";

import { BrandLogo } from "@afterservice/ui";
import { appMetadata } from "@afterservice/utils";
import dynamic from "next/dynamic";
import { useRef } from "react";
import {
  type SignInFieldValues,
  SignInForm,
} from "@/components/auth/sign-in-form";

const DevLoginFab = dynamic(
  () =>
    import("@/components/dev/dev-login-fab").then((m) => ({
      default: m.DevLoginFab,
    })),
  { ssr: false },
);

type SignInValues = SignInFieldValues;
type SignInAdapter = React.MutableRefObject<{
  getValues: () => SignInValues;
  reset: (values: SignInValues) => void;
  setValue: (name: string, value: unknown) => void;
} | null>;

export default function SignInPage() {
  const adapterRef = useRef<SignInAdapter["current"]>(null);

  const returnTo = getReturnTo();

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
    <AuthLayout
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
            handleSignIn({ email: account.email, password: account.password });
          }}
        />
      )}
    </AuthLayout>
  );
}

function getReturnTo() {
  if (typeof window === "undefined") return "/";
  const returnTo = new URLSearchParams(window.location.search).get("return_to");
  if (!returnTo?.startsWith("/")) return "/";
  if (returnTo.startsWith("//")) return "/";
  return returnTo;
}

function AuthLayout({
  children,
  description,
  footer,
  title,
}: {
  children: React.ReactNode;
  description: string;
  footer?: React.ReactNode;
  title: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-[400px] bg-background border border-border shadow-sm rounded-xl p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <BrandLogo name={appMetadata.name} />
        </div>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        </div>
        {children}
        {footer ? <div className="mt-6 pt-6 border-t border-border">{footer}</div> : null}
      </div>
    </div>
  );
}

function AuthFooter({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-center text-muted-foreground">{children}</div>;
}
