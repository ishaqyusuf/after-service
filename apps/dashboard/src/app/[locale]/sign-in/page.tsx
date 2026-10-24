import { getDbClient } from "@afterservice/db";
import { getSafeReturnTo } from "@afterservice/utils";
import type { Metadata } from "next";
import { SignInView } from "@/components/auth/sign-in-view";
import { redirectAuthenticatedUser } from "@/lib/redirect-authenticated-user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in | afterservice",
  description: "Sign in to the afterservice dashboard.",
};

type DbAccountDebug = {
  accounts: Array<{
    accountId: string;
    id: string;
    providerId: string;
    userId: string;
  }>;
  error?: string;
};

const AUTH_DEBUG =
  process.env.NODE_ENV !== "production" &&
  (process.env.AFTERSERVICE_AUTH_DEBUG === "true" ||
    process.env.AUTH_DEBUG === "true");

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ password_reset?: string; return_to?: string }>;
}) {
  const query = await searchParams;
  const returnTo = getSafeReturnTo(query.return_to);
  await redirectAuthenticatedUser(returnTo);
  return (
    <SignInView
      dbAccountDebug={await getDbAccountDebug()}
      passwordResetComplete={query.password_reset === "success"}
      returnTo={returnTo}
    />
  );
}

async function getDbAccountDebug(): Promise<DbAccountDebug | undefined> {
  if (!AUTH_DEBUG) {
    return undefined;
  }

  try {
    const db = getDbClient();
    const accounts = await db.account.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        accountId: true,
        id: true,
        providerId: true,
        userId: true,
      },
      take: 20,
    });

    return { accounts };
  } catch (error) {
    return {
      accounts: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
