import { mobaraGamesData } from "@/data/games/mobara";
import type { GameEntry, RegionGamesData } from "@/data/games/types";
import { isValidRegion, type RegionSlug } from "@/data/regions";

const GAMES_BY_REGION: Partial<Record<RegionSlug, RegionGamesData>> = {
  mobara: mobaraGamesData,
};

const EMPTY: RegionGamesData = { intro: "", games: [] };

export function getRegionGamesData(slug: string): RegionGamesData {
  if (!isValidRegion(slug)) return EMPTY;
  return GAMES_BY_REGION[slug] ?? EMPTY;
}

export function getGameBySlug(
  regionSlug: string,
  gameSlug: string
): GameEntry | undefined {
  return getRegionGamesData(regionSlug).games.find(
    (game) => game.slug === gameSlug
  );
}
