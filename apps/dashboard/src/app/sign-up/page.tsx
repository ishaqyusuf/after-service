import { AuthForm } from "@/lib/auth-form";
import { PageShell } from "@/lib/page-shell";

export default function SignUpPage() {
  return (
    <PageShell
      description="Create an owner account, then set up the workspace."
      eyebrow="Authentication"
      title="Sign up"
    >
      <AuthForm mode="sign-up" />
    </PageShell>
  );
}
