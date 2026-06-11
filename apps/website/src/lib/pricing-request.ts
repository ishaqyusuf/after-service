import { cookies, headers } from "next/headers";
import {
  getHeaderPricingHints,
  PRICING_REGION_COOKIE,
  resolvePricingRegion,
  type PricingResolution,
} from "@afterservice/plans";

type SearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>
  | undefined;

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function getPricingResolution(
  searchParams?: SearchParams,
): Promise<PricingResolution> {
  const headerList = await headers();
  const cookieStore = await cookies();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { continent, country } = getHeaderPricingHints(headerList);

  return resolvePricingRegion({
    continent,
    cookieRegion: cookieStore.get(PRICING_REGION_COOKIE)?.value,
    country,
    queryCurrency: firstSearchValue(resolvedSearchParams.currency),
    queryRegion: firstSearchValue(resolvedSearchParams.region),
  });
}
