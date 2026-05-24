import { PageShell } from "@/lib/page-shell";

export default function SignUpPage() {
  return (
    <PageShell
      actionHref="/onboarding"
      actionLabel="Start onboarding"
      description="Account creation will connect this route in Phase 6."
      title="Sign up"
    />
  );
}
