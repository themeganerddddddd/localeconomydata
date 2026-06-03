import { counties } from "@/data/counties";

export function regionSlug(region: string) {
  return region.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function regionTitle(slug: string) {
  return regions().find((region) => regionSlug(region) === slug) ?? slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

export function regions() {
  return Array.from(new Set(counties.map((county) => county.region))).sort();
}

export function countiesForRegion(slug: string) {
  const title = regionTitle(slug);
  return counties.filter((county) => county.region === title);
}
