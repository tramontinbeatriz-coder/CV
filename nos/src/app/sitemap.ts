export const dynamic = "force-dynamic";

import type { MetadataRoute } from "next";
import { config } from "@/lib/config";
import { getUpcomingEvents } from "@/lib/events";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getUpcomingEvents();
  const base = config.siteUrl;
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/eventos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/sobre`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/passados`, changeFrequency: "weekly", priority: 0.6 },
    ...events.map((e) => ({ url: `${base}/eventos/${e.slug}`, lastModified: e.updatedAt, priority: 0.8 })),
  ];
}
