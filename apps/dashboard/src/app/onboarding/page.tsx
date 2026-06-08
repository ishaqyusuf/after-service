import { Badge } from "@afterservice/ui";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupCompletionTracker } from "@/components/analytics/signup-completion-tracker";
import { ErrorBoundary } from "@/components/error-boundary";
import { OnboardingForm } from "@/components/forms/onboarding-form";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Onboarding | After Service",
    description:
      "Create the workspace, owner membership, and starter templates.",
  };
}

export default async function OnboardingPage() {
  // TODO: trpc prefetch here
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <SignupCompletionTracker />
      </Suspense>
      <div className="space-y-8 max-w-2xl mx-auto py-12">
        <header className="space-y-2">
          <Badge
            variant="outline"
            className="text-primary border-primary/50 bg-primary/10"
          >
            Workspace setup
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Onboarding</h1>
          <p className="text-muted-foreground">
            Create the workspace, owner membership, and starter follow-up
            templates.
          </p>
        </header>

        <Suspense
          fallback={<div className="animate-pulse h-64 bg-muted rounded-xl" />}
        >
          <OnboardingForm />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
