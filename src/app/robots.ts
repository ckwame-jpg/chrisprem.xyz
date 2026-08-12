import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/os/links";

const base = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
