import type { onboardingSchema } from "@afterservice/api/schemas";
import type { z } from "zod";

export type OnboardingValues = z.infer<typeof onboardingSchema>;
type OnboardingResult =
  | { status: "success" }
  | { status: "unauthorized" }
  | { status: "error"; message: string };
type OnboardingFetch = (url: string, options: RequestInit) => Promise<Response>;

export const onboardingFailureMessage =
  "We couldn't create your business right now. Your details are still here. Please try again.";

export async function submitOnboarding(
  values: OnboardingValues,
  request: OnboardingFetch = fetch,
  timeoutMs = 20_000,
): Promise<OnboardingResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await request("/api/onboarding", {
      body: JSON.stringify(values),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      signal: controller.signal,
    });
    if (response.status === 401) return { status: "unauthorized" };
    if (response.ok) return { status: "success" };
    if (response.status === 400) {
      const payload: unknown = await response.json().catch(() => null);
      if (
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        typeof payload.error === "string" &&
        payload.error.length > 0 &&
        payload.error.length <= 300
      ) {
        return { status: "error", message: payload.error };
      }
    }
    return {
      status: "error",
      message:
        response.status === 429
          ? "Too many attempts. Wait a moment and try again. Your details are still here."
          : onboardingFailureMessage,
    };
  } catch {
    return {
      status: "error",
      message: controller.signal.aborted
        ? "This is taking longer than expected. Your details are still here. Please try again."
        : "We couldn't connect. Check your internet connection and try again. Your business details are still here.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
