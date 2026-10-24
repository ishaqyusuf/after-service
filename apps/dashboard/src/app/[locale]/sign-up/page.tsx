import type { Metadata } from "next";
import { SignUpView } from "@/components/auth/sign-up-view";
import { redirectAuthenticatedUser } from "@/lib/redirect-authenticated-user";

export const metadata: Metadata = {
  title: "Sign up | afterservice",
  description: "Create an afterservice dashboard account.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  await redirectAuthenticatedUser((await searchParams).return_to);
  return <SignUpView />;
}
