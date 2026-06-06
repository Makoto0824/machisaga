import { hogeCity } from "@/data/regions/hoge-city";
import { mobara } from "@/data/regions/mobara";
import type { RegionConfig } from "@/data/types";

export const REGIONS = {
  mobara,
  "hoge-city": hogeCity,
} as const satisfies Record<string, RegionConfig>;

export type RegionSlug = keyof typeof REGIONS;

export const REGION_SLUGS = Object.keys(REGIONS) as RegionSlug[];

export const DEFAULT_REGION: RegionSlug = "mobara";

export function isValidRegion(slug: string): slug is RegionSlug {
  return slug in REGIONS;
}

export function getRegion(slug: string): RegionConfig | null {
  if (!isValidRegion(slug)) return null;
  return REGIONS[slug];
}
