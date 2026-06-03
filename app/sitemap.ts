import { counties } from "@/data/counties";
import { industries } from "@/data/industries";
import { siteConfig } from "@/lib/seo";
import { regionSlug, regions } from "@/lib/regions";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();
  const staticRoutes = [
    "/", "/counties", "/compare", "/industries", "/regions", "/guides", "/methodology", "/about", "/contact", "/privacy", "/terms",
    "/guides/best-counties-for-business-expansion-dc-region",
    "/guides/montgomery-vs-fairfax-business-expansion",
    "/guides/best-counties-for-life-sciences-dc-region",
    "/guides/best-counties-for-business-expansion-east-coast"
  ];
  return [
    ...staticRoutes.map((path) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: "monthly" as const, priority: path === "/" ? 1 : 0.7 })),
    ...regions().map((region) => ({ url: `${base}/regions/${regionSlug(region)}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.75 })),
    ...counties.map((county) => ({ url: `${base}/counties/${county.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...industries.map((industry) => ({ url: `${base}/industries/${industry.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 }))
  ];
}
