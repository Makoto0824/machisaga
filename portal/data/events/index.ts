import { mobaraEvents } from "@/data/events/mobara";
import type { RegionEventList } from "@/data/events/types";
import { isValidRegion, type RegionSlug } from "@/data/regions";

const EVENTS_BY_REGION: Partial<Record<RegionSlug, RegionEventList>> = {
  mobara: mobaraEvents,
};

export function getRegionEvents(slug: string): RegionEventList {
  if (!isValidRegion(slug)) return [];
  return EVENTS_BY_REGION[slug] ?? [];
}
