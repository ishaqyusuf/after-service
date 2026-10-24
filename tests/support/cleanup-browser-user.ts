import { localTestDb } from "./local-db";

// Prisma's generated TypeScript client runs in Bun, like the application.
// Playwright remains on its supported Node.js runner.
const email = process.argv[2];
if (!email || !/^browser-[a-f0-9-]+@afterservice\.invalid$/.test(email)) {
  throw new Error(
    "Cleanup requires one exact generated browser-test identity.",
  );
}
const db = localTestDb();
try {
  const user = await db.user.findUnique({
    where: { email },
    include: { memberships: true },
  });
  if (user) {
    for (const membership of user.memberships) {
      const members = await db.membership.count({
        where: { workspaceId: membership.workspaceId },
      });
      if (members !== 1 || membership.role !== "owner") {
        throw new Error(
          "Refusing to delete a browser workspace with unexpected memberships.",
        );
      }
      await db.workspace.delete({ where: { id: membership.workspaceId } });
    }
    await db.user.delete({ where: { id: user.id } });
  }
} finally {
  await db.$disconnect();
}
