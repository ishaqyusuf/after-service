import "server-only";
import { createContext } from "@afterservice/api/context";
import { getSafeReturnTo } from "@afterservice/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function redirectAuthenticatedUser(returnTo: unknown) {
  const context = await createContext(
    new Request("http://afterservice.internal", { headers: await headers() }),
  );
  if (!context.user) return;
  if (!context.workspace) redirect("/onboarding");
  const destination = getSafeReturnTo(returnTo);
  // An auth page cannot redirect back to itself for an existing session.
  redirect(
    /^\/(?:en\/)?sign-(?:in|up)(?:[/?#]|$)/.test(destination)
      ? "/"
      : destination,
  );
}
