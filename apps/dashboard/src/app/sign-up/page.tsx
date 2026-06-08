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
    <div className="min-h-screen w-full flex bg-background">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] lg:px-20 xl:px-24 border-r border-border/40">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex mb-8">
            <BrandLogo name={appMetadata.name} />
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          </div>
          {children}
          {footer ? <div className="mt-8">{footer}</div> : null}
          <p className="text-xs text-center text-muted-foreground/60 mt-8">
            Secure authentication. Your data stays private.
          </p>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 relative bg-muted items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="z-10 text-center max-w-lg px-8 backdrop-blur-sm bg-background/30 p-8 rounded-2xl border border-white/10 shadow-2xl">
          <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">Join After Service today</h2>
          <p className="text-lg text-foreground/80">Get started in seconds and take control of your service operations like never before.</p>
        </div>
      </div>
    </div>
  );
}

function AuthFooter({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-center text-muted-foreground">{children}</div>;
}
