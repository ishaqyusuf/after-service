import type { Metadata } from "next";
import { JsonLd } from "../components/json-ld";
import { LaunchedPage } from "../components/launched";
import {
  createPageMetadata,
  organizationJsonLd,
  softwareApplicationJsonLd,
} from "../lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "afterservice | Post-job follow-up board for service shops",
    description:
      "Join the free beta for a manual-first follow-up board built for repair shops, installers, contractors, and local service teams.",
    path: "/",
  });
}

export default async function HomePage() {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), softwareApplicationJsonLd()]} />
      <LaunchedPage />
    </>
  );
}
