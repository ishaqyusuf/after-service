import { z } from "zod";

export type OnboardingDraftStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

const draftValuesSchema = z.object({
  businessName: z.string().max(1000),
  businessType: z.string().max(1000).default(""),
  serviceCategory: z.string().max(1000).default(""),
  defaultFollowUpDelayDays: z.number().int().min(1).max(365),
});
const draftSchema = z.object({
  version: z.literal(1),
  savedAt: z.number().finite(),
  values: draftValuesSchema,
});
const lifetimeMs = 24 * 60 * 60 * 1000;
const key = (userId: string) => `afterservice:onboarding:${userId}`;

export function readOnboardingDraft(
  storage: OnboardingDraftStorage | null,
  userId: string,
  now = Date.now(),
): z.infer<typeof draftValuesSchema> | null {
  try {
    const raw = storage?.getItem(key(userId));
    if (!raw) return null;
    const parsed = draftSchema.safeParse(JSON.parse(raw));
    if (
      !parsed.success ||
      parsed.data.savedAt > now ||
      now - parsed.data.savedAt >= lifetimeMs
    ) {
      clearOnboardingDraft(storage, userId);
      return null;
    }
    return parsed.data.values;
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(
  storage: OnboardingDraftStorage | null,
  userId: string,
  values: unknown,
  now = Date.now(),
): boolean {
  const parsed = draftValuesSchema.safeParse(values);
  if (!storage || !parsed.success) return false;
  try {
    storage.setItem(
      key(userId),
      JSON.stringify({ version: 1, savedAt: now, values: parsed.data }),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearOnboardingDraft(
  storage: OnboardingDraftStorage | null,
  userId: string,
): void {
  try {
    storage?.removeItem(key(userId));
  } catch {
    // Storage restrictions must never prevent completion or recovery.
  }
}
