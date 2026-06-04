import { appMetadata } from "@afterservice/utils";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#ffffff",
    categories: ["business", "productivity"],
    description: appMetadata.description,
    display: "standalone",
    icons: [
      {
        sizes: "192x192",
        src: "/icons/icon-192.png",
        type: "image/png",
      },
      {
        sizes: "512x512",
        src: "/icons/icon-512.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "/icons/maskable-512.png",
        type: "image/png",
      },
    ],
    name: appMetadata.name,
    scope: "/",
    short_name: appMetadata.name,
    start_url: "/",
    theme_color: "#009b98",
  };
}
