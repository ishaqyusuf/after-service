import { OnboardingForm } from "@/components/forms/onboarding-form";
import { Badge } from "@afterservice/ui";

export default function OnboardingPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto py-12">
      <header className="space-y-2">
        <Badge variant="outline" className="text-primary border-primary/50 bg-primary/10">Workspace setup</Badge>
        <h1 className="text-3xl font-bold tracking-tight">Onboarding</h1>
        <p className="text-muted-foreground">
          Create the workspace, owner membership, and starter follow-up templates.
        </p>
      </header>
      
      <OnboardingForm />
    </div>
  );
}
