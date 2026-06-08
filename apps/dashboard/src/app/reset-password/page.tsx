import { BrandLogo } from "@afterservice/ui";
import { appMetadata } from "@afterservice/utils";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your account",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] lg:px-20 xl:px-24 border-r border-border/40">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex mb-8">
            <BrandLogo name={appMetadata.name} />
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Set new password</h1>
            <p className="text-sm text-muted-foreground mt-2">Please enter your new password below.</p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
      <div className="hidden lg:flex flex-1 relative bg-muted items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="z-10 text-center max-w-lg px-8 backdrop-blur-sm bg-background/30 p-8 rounded-2xl border border-white/10 shadow-2xl">
          <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">Secure your account</h2>
          <p className="text-lg text-foreground/80">Get back access to your workspace and operations quickly and securely.</p>
        </div>
      </div>
    </div>
  );
}
