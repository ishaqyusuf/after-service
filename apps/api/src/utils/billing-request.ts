import { isIP } from "node:net";
import { resolveRequestPricing } from "@afterservice/plans/checkout";

export function getBillingRequestContext(headers: Headers) {
  const ip = headers.get("cf-ray")
    ? headers.get("cf-connecting-ip")
    : headers.get("x-real-ip");
  return {
    pricing: resolveRequestPricing(headers),
    customerIpAddress: ip && isIP(ip) ? ip : undefined,
  };
}
