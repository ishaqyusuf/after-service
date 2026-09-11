import {
  QA_ACCELERATOR_CONTRACT_VERSION,
  appendWebSessionCookies,
  getQaWebAvailability,
  qaAccessErrorResponse,
  qaAvailabilityResponse,
  selectQaWebProfile,
} from "@/lib/qa-access-server";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const inputSchema = z.object({
  profileReference: z.string().trim().min(32).max(160),
});

export async function POST(request: NextRequest) {
  const availability = getQaWebAvailability(
    request,
    QA_ACCELERATOR_CONTRACT_VERSION,
    true,
  );
  if (!availability.available) return qaAvailabilityResponse(availability);

  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Select an available QA workspace." },
      { status: 400 },
    );
  }

  try {
    const result = await selectQaWebProfile(
      request,
      parsed.data.profileReference,
    );
    const response = NextResponse.json({ profile: result.profile });
    appendWebSessionCookies(response, result);
    return response;
  } catch (error) {
    return qaAccessErrorResponse(error);
  }
}
