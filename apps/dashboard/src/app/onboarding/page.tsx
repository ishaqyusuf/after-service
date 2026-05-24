import { OnboardingForm } from "@/lib/onboarding-form";
import { PageShell } from "@/lib/page-shell";

export default function OnboardingPage() {
  return (
    <PageShell
      description="Create the workspace, owner membership, and starter follow-up templates."
      eyebrow="Workspace setup"
      title="Onboarding"
    >
      <OnboardingForm />
    </PageShell>
  );
}
