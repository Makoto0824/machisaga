import type { GameEntry } from "@/data/games/types";
import { dpBadgeMuted, dpCardLight } from "@/components/ui/theme";

type Props = {
  game: GameEntry;
};

export function GameCard({ game }: Props) {
  const isReady = game.status === "ready" && game.staticPath;

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-bold text-zinc-900">{game.title}</h2>
        {isReady ? (
          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#b8e06a] text-zinc-900 border border-[#222]">
            遊べる
          </span>
        ) : (
          <span className={dpBadgeMuted}>準備中</span>
        )}
      </div>
      <p className="text-sm text-zinc-600 mt-2 leading-relaxed">{game.summary}</p>
      {isReady ? (
        <p className="mt-3 text-sm font-bold text-[#e8384f]">タップしてプレイ →</p>
      ) : null}
    </>
  );

  if (isReady) {
    return (
      <a
        href={game.staticPath}
        className={`${dpCardLight} block p-4 transition-transform active:scale-[0.99]`}
      >
        {body}
      </a>
    );
  }

  return <article className={`${dpCardLight} p-4 opacity-80`}>{body}</article>;
}
