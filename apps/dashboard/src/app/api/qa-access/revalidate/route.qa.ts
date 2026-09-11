import {
  QA_ACCELERATOR_CONTRACT_VERSION,
  clearQaAuthorizationCookie,
  getQaWebAvailability,
  qaAccessErrorResponse,
  qaAvailabilityResponse,
  revalidateQaWebAuthorization,
} from "@/lib/qa-access-server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const availability = getQaWebAvailability(
    request,
    QA_ACCELERATOR_CONTRACT_VERSION,
    true,
  );
  if (!availability.available) return qaAvailabilityResponse(availability);

  try {
    return NextResponse.json(await revalidateQaWebAuthorization(request));
  } catch (error) {
    const response = qaAccessErrorResponse(error);
    clearQaAuthorizationCookie(response, request);
    return response;
  }
}
