import { PageShell } from "@/lib/page-shell";

export default function OnboardingPage() {
  return (
    <PageShell
      actionHref="/customers"
      actionLabel="Preview workspace"
      description="Workspace setup fields will be added in the onboarding phase."
      title="Onboarding"
    />
  );
}
