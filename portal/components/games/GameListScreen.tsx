"use client";

import { useRegion } from "@/components/RegionProvider";
import { GameCard } from "@/components/games/GameCard";
import { getRegionGamesData } from "@/data/games";
import { dpLabel, dpSubtitle, dpTitle } from "@/components/ui/theme";

export function GameListScreen() {
  const region = useRegion();
  const data = getRegionGamesData(region.slug);

  return (
    <div className="app-scroll flex-1 flex flex-col px-4 pb-4">
      <header className="dp-screen-header">
        <p className={dpLabel}>ゲーム</p>
        <h1 className={`${dpTitle} mt-1`}>ミニゲーム</h1>
        {data.intro ? (
          <p className={`${dpSubtitle} mt-1`}>{data.intro}</p>
        ) : null}
      </header>

      {data.games.length === 0 ? (
        <p className="text-sm text-zinc-500 mt-6">公開中のゲームはありません。</p>
      ) : (
        <ul className="flex flex-col gap-3 mt-6">
          {data.games.map((game) => (
            <li key={game.id}>
              <GameCard game={game} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
