import { mobaraEventsData } from "@/data/events/mobara";
import type { RegionEventsData } from "@/data/events/types";
import { isValidRegion, type RegionSlug } from "@/data/regions";

const EVENTS_BY_REGION: Partial<Record<RegionSlug, RegionEventsData>> = {
  mobara: mobaraEventsData,
};

const EMPTY: RegionEventsData = { links: [], storeEvents: [] };

export function getRegionEventsData(slug: string): RegionEventsData {
  if (!isValidRegion(slug)) return EMPTY;
  return EVENTS_BY_REGION[slug] ?? EMPTY;
}
