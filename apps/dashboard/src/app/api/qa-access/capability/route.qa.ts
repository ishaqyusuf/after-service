import {
  getQaWebAvailability,
  qaAvailabilityResponse,
} from "@/lib/qa-access-server";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contractVersionSchema = z.coerce.number().int().positive();

export async function GET(request: NextRequest) {
  const value = request.nextUrl.searchParams.get("contractVersion");
  const parsedContractVersion = contractVersionSchema.safeParse(value);
  const contractVersion = parsedContractVersion.success
    ? parsedContractVersion.data
    : Number.NaN;
  const availability = getQaWebAvailability(request, contractVersion);
  return !availability.available &&
    availability.category === "environment_not_allowed"
    ? qaAvailabilityResponse(availability)
    : NextResponse.json(availability);
}
