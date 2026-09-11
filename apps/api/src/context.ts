import { auth } from "@afterservice/auth";
import {
  getDbClient,
  type MembershipRole,
  validateQaDerivedSession,
} from "@afterservice/db";

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
  const qaValidation = session?.session.qaAuthorizationId
    ? await validateQaDerivedSession(db, session.session.id)
    : null;
  const effectiveSession = qaValidation?.active === false ? null : session;
  const [membership, platformUser] = effectiveSession?.user
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
            id: qaValidation?.scope?.membershipId,
            userId: effectiveSession.user.id,
          },
        }),
        db.user.findUnique({
          where: { id: effectiveSession.user.id },
          select: { platformRole: true },
        }),
      ])
    : [null, null];

  return {
    session: effectiveSession,
    requestId: crypto.randomUUID(),
    user: effectiveSession?.user ?? null,
    platformRole: qaValidation?.scope
      ? "user"
      : (platformUser?.platformRole ?? "user"),
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
