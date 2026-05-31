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
        <p className="text-xs text-center text-muted-foreground/60 mt-4">
          Secure authentication. Your data stays private.
        </p>
      </div>
    </div>
  );
}

function AuthFooter({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-center text-muted-foreground">{children}</div>;
}
