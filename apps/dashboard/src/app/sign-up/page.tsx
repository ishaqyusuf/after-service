"use client";

import { BrandLogo } from "@afterservice/ui";
import { appMetadata } from "@afterservice/utils";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { SignUpForm } from "@/components/auth/sign-up-form";
import type { QuickFillFormAdapter } from "@/components/dev/quick-fill";

const DevSignupFab = dynamic(
  () =>
    import("@/components/dev/dev-signup-fab").then((m) => ({
      default: m.DevSignupFab,
    })),
  { ssr: false },
);

type SignUpValues = { name: string; email: string; password: string };

export default function SignUpPage() {
  const adapterRef = useRef<QuickFillFormAdapter<SignUpValues> | null>(null);

  async function handleSignUp(values: SignUpValues) {
    const response = await fetch("/api/auth/sign-up/email", {
      body: JSON.stringify({
        callbackURL: "/onboarding",
        email: values.email,
        name: values.name,
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
      throw new Error(payload?.message ?? "Sign-up failed.");
    }

    if (process.env.NODE_ENV !== "production") {
      try {
        const { addDevAccount } = await import(
          "@/components/dev/dev-auth-store"
        );
        addDevAccount({
          name: values.name,
          email: values.email,
          password: values.password,
        });
      } catch {
        // dev store is best-effort
      }
    }

    window.location.href = "/onboarding";
  }

  return (
    <AuthLayout
      description="Create an owner account, then set up the workspace."
      footer={
        <AuthFooter>
          Already have an account? <a href="/sign-in">Sign in</a>
        </AuthFooter>
      }
      title="Create your account"
    >
      <SignUpForm onSignUp={handleSignUp} adapterRef={adapterRef} />
      {process.env.NODE_ENV !== "production" && (
        <DevSignupFab
          onFill={(values: SignUpValues) => {
            adapterRef.current?.reset(values);
          }}
        />
      )}
    </AuthLayout>
  );
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
        <p className="auth-card__trust">
          Secure authentication. Your data stays private.
        </p>
      </div>
    </div>
  );
}

function AuthFooter({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 14, color: "#5e6a62" }}>{children}</div>;
}
