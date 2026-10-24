import { createContext } from "@afterservice/api/context";
import { Badge } from "@afterservice/ui";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignupCompletionTracker } from "@/components/analytics/signup-completion-tracker";
import { OnboardingHelp } from "@/components/assistant/onboarding-help";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorFallback } from "@/components/error-fallback";
import {
  OnboardingForm,
  OnboardingFormSkeleton,
} from "@/components/forms/onboarding-form";

export const metadata: Metadata = {
  title: "Onboarding | afterservice",
  description: "Create the workspace, owner membership, and starter templates.",
};

export default async function OnboardingPage() {
  const context = await createContext(
    new Request("http://afterservice.internal", { headers: await headers() }),
  );
  if (!context.user) redirect("/sign-in?return_to=%2Fonboarding");
  if (context.workspace) redirect("/");

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={null}>
        <SignupCompletionTracker />
      </Suspense>
      <div className="space-y-8 max-w-2xl mx-auto px-4 py-12">
        <OnboardingHelp />
        <header className="space-y-2">
          <Badge
            variant="outline"
            className="text-primary border-primary/50 bg-primary/10"
          >
            Workspace setup
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Onboarding</h1>
          <p className="text-muted-foreground">
            Set up your business to start tracking customers and follow-ups.
            Only your business name is required.
          </p>
        </header>

        <Suspense fallback={<OnboardingFormSkeleton />}>
          <OnboardingForm userId={context.user.id} />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
