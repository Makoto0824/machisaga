import { mobaraOtherContent } from "@/data/other/mobara";
import { mobaraRoadmapContent } from "@/data/other/roadmap";
import { mobaraTradingCardContent } from "@/data/other/tradingCards";
import type {
  RegionOtherContent,
  RegionRoadmapContent,
  RegionTradingCardContent,
} from "@/data/other/types";
import { isValidRegion, type RegionSlug } from "@/data/regions";

const OTHER_BY_REGION: Partial<Record<RegionSlug, RegionOtherContent>> = {
  mobara: mobaraOtherContent,
};

const TRADING_CARDS_BY_REGION: Partial<
  Record<RegionSlug, RegionTradingCardContent>
> = {
  mobara: mobaraTradingCardContent,
};

const ROADMAP_BY_REGION: Partial<Record<RegionSlug, RegionRoadmapContent>> = {
  mobara: mobaraRoadmapContent,
};

export function getRegionOtherContent(slug: string): RegionOtherContent | null {
  if (!isValidRegion(slug)) return null;
  return OTHER_BY_REGION[slug] ?? null;
}

export function getRegionTradingCardContent(
  slug: string
): RegionTradingCardContent | null {
  if (!isValidRegion(slug)) return null;
  return TRADING_CARDS_BY_REGION[slug] ?? null;
}

export function getRegionRoadmapContent(
  slug: string
): RegionRoadmapContent | null {
  if (!isValidRegion(slug)) return null;
  return ROADMAP_BY_REGION[slug] ?? null;
}
