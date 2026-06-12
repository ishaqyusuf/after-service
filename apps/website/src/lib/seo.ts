import { appMetadata, siteRootDomain } from "@afterservice/utils";
import type { Metadata, MetadataRoute } from "next";

export const siteUrl = `https://${siteRootDomain}`;
export const socialImage = {
  alt: "afterservice - one board for every post-job customer follow-up",
  height: 630,
  path: "/opengraph-image",
  width: 1200,
} as const;

export type PublicRoute = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

export const publicRoutes: PublicRoute[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/features", priority: 0.8, changeFrequency: "monthly" },
  {
    path: "/features/follow-up-board",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  { path: "/features/templates", priority: 0.7, changeFrequency: "monthly" },
  {
    path: "/features/customer-history",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  { path: "/customers", priority: 0.7, changeFrequency: "monthly" },
  { path: "/signup", priority: 0.7, changeFrequency: "monthly" },
  {
    path: "/solutions/repair-shops",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  { path: "/solutions/installers", priority: 0.8, changeFrequency: "monthly" },
  { path: "/solutions/contractors", priority: 0.8, changeFrequency: "monthly" },
  {
    path: "/solutions/field-service-teams",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "/guides/post-job-follow-up",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/guides/review-request-workflow",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/guides/issue-recovery-follow-up",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function createPageMetadata({
  description,
  noIndex = false,
  path,
  title,
}: {
  description: string;
  noIndex?: boolean;
  path: string;
  title: string;
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(socialImage.path);

  return {
    alternates: {
      canonical: url,
    },
    description,
    openGraph: {
      description,
      images: [
        {
          alt: socialImage.alt,
          height: socialImage.height,
          url: imageUrl,
          width: socialImage.width,
        },
      ],
      locale: "en_US",
      siteName: appMetadata.name,
      title,
      type: "website",
      url,
    },
    robots: noIndex
      ? {
          follow: false,
          index: false,
          nocache: true,
        }
      : {
          follow: true,
          index: true,
        },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [
        {
          alt: socialImage.alt,
          url: imageUrl,
        },
      ],
      title,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    email: "hello@afterservice.app",
    name: appMetadata.name,
    url: siteUrl,
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    applicationCategory: "BusinessApplication",
    description: appMetadata.description,
    name: appMetadata.name,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "USD",
    },
    operatingSystem: "Web",
    url: siteUrl,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(item.path),
      name: item.name,
      position: index + 1,
    })),
  };
}
