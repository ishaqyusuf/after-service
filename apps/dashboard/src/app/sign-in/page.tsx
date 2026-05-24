import { AuthForm } from "@/lib/auth-form";
import { PageShell } from "@/lib/page-shell";

export default function SignInPage() {
  return (
    <PageShell
      description="Use your operator account to access the dashboard."
      eyebrow="Authentication"
      title="Sign in"
    >
      <AuthForm mode="sign-in" />
    </PageShell>
  );
}
