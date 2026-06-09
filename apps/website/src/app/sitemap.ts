import type { MetadataRoute } from "next";
import { absoluteUrl, publicRoutes } from "@/lib/seo";

const lastModified = new Date("2026-06-09");

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    changeFrequency: route.changeFrequency,
    lastModified,
    priority: route.priority,
    url: absoluteUrl(route.path),
  }));
}
