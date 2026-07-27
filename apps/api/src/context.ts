import { auth } from "@afterservice/auth";
import { getDbClient, type MembershipRole } from "@afterservice/db";

type BetterAuthSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

export type ApiWorkspaceContext = {
  id: string;
  role: MembershipRole;
  slug: string;
} | null;

export type ApiContext = {
  requestId: string;
  session: BetterAuthSession | null;
  user: BetterAuthSession["user"] | null;
  workspace: ApiWorkspaceContext;
  platformRole: "user" | "platform_admin";
};

export async function createContext(request?: Request): Promise<ApiContext> {
  const session = request
    ? await auth.api.getSession({
        headers: request.headers,
      })
    : null;
  const db = getDbClient();
  const [membership, platformUser] = session?.user
    ? await Promise.all([
        db.membership.findFirst({
          orderBy: {
            createdAt: "asc",
          },
          select: {
            role: true,
            workspace: {
              select: {
                id: true,
                slug: true,
                qaPurgeStartedAt: true,
              },
            },
          },
          where: {
            userId: session.user.id,
          },
        }),
        db.user.findUnique({
          where: { id: session.user.id },
          select: { platformRole: true },
        }),
      ])
    : [null, null];

  return {
    session,
    requestId: crypto.randomUUID(),
    user: session?.user ?? null,
    platformRole: platformUser?.platformRole ?? "user",
    workspace: membership
      ? membership.workspace.qaPurgeStartedAt
        ? null
        : {
            id: membership.workspace.id,
            role: membership.role,
            slug: membership.workspace.slug,
          }
      : null,
  };
}
