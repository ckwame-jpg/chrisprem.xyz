import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/os/links";

const base = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    {
      url: `${base}/playground/latency`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: `${base}/v1`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
