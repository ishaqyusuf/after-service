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
        </div>
      </div>
      <div className="hidden lg:flex flex-1 relative bg-muted items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="z-10 text-center max-w-lg px-8 backdrop-blur-sm bg-background/30 p-8 rounded-2xl border border-white/10 shadow-2xl">
          <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">Manage your service operations efficiently</h2>
          <p className="text-lg text-foreground/80">The all-in-one platform for your post-sales support, service jobs, and customer relationships.</p>
        </div>
      </div>
    </div>
  );
}

function AuthFooter({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-center text-muted-foreground">{children}</div>;
}
