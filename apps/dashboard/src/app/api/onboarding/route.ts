import { auth } from "@afterservice/auth";
import { buildWorkspaceTemplateSeed, getDbClient } from "@afterservice/db";
import { z } from "zod";

const onboardingSchema = z.object({
  businessName: z.string().trim().min(1),
  businessType: z.string().trim().optional(),
  defaultFollowUpDelayDays: z.coerce.number().int().min(1).max(365).default(7),
  serviceCategory: z.string().trim().optional(),
});

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || `workspace-${crypto.randomUUID().slice(0, 8)}`
  );
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = onboardingSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid onboarding payload" },
      { status: 400 },
    );
  }

  const db = getDbClient();
  const existingMembership = await db.membership.findFirst({
    select: {
      workspace: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
    where: {
      userId: session.user.id,
    },
  });

  if (existingMembership) {
    return Response.json({
      ok: true,
      workspace: existingMembership.workspace,
    });
  }

  const baseSlug = slugify(parsed.data.businessName);
  const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;
  const workspace = await db.$transaction(async (tx) => {
    const created = await tx.workspace.create({
      data: {
        businessType: parsed.data.businessType,
        defaultFollowUpDelayDays: parsed.data.defaultFollowUpDelayDays,
        name: parsed.data.businessName,
        serviceCategory: parsed.data.serviceCategory,
        slug,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    await tx.membership.create({
      data: {
        role: "owner",
        userId: session.user.id,
        workspaceId: created.id,
      },
    });

    await tx.followUpTemplate.createMany({
      data: buildWorkspaceTemplateSeed(created.id),
    });

    return created;
  });

  return Response.json({
    ok: true,
    workspace,
  });
}
