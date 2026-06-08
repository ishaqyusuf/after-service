import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_DASHBOARD_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4101",
});

export const { signIn, signUp, useSession } = authClient;
