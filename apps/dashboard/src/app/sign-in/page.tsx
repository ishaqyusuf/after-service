import type { Metadata } from "next";
import { SignInView } from "@/components/auth/sign-in-view";

export const metadata: Metadata = {
  title: "Sign in | afterservice",
  description: "Sign in to the afterservice dashboard.",
};

export default function SignInPage() {
  return <SignInView />;
}
