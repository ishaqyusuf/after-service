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
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-card__brand">
          <BrandLogo name={appMetadata.name} />
        </div>
        <h1 className="auth-card__title">{title}</h1>
        <p className="auth-card__description">{description}</p>
        {children}
        {footer ? <div className="auth-card__footer">{footer}</div> : null}
      </div>
    </div>
  );
}

function AuthFooter({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 14, color: "#5e6a62" }}>{children}</div>;
}
