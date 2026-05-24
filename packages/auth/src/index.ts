export type AuthenticatedUser = {
  email: string;
  id: string;
  name?: string | null;
};

export type AuthSession = {
  user: AuthenticatedUser;
} | null;

export const authRoutes = {
  dashboardHome: "/",
  onboarding: "/onboarding",
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;
