export const dynamic = "force-dynamic";

import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/checkout", "/confirmacao", "/inscricao"] }],
    sitemap: `${config.siteUrl}/sitemap.xml`,
  };
}
