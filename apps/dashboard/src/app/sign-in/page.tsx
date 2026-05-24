import { PageShell } from "@/lib/page-shell";

export default function SignInPage() {
  return (
    <PageShell
      actionHref="/"
      actionLabel="Continue"
      description="Authentication will connect this route in Phase 6."
      title="Sign in"
    />
  );
}
