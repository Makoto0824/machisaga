import type { RegionGamesData } from "@/data/games/types";
import { publicPath } from "@/lib/paths";

export const mobaraGamesData: RegionGamesData = {
  intro: "まちサーガのミニゲームを楽しもう。新しいゲームも順次追加予定です。",
  games: [
    {
      id: "find-the-hero",
      slug: "find-the-hero",
      title: "勇者を探せ！",
      summary:
        "隠れた勇者を探す、タップで遊べるミニゲームです。茂原市の勇者が登場します。",
      status: "ready",
      staticPath: publicPath("/games/find-the-hero/index.html"),
    },
    {
      id: "super-jam-roll-challenge",
      slug: "super-jam-roll-challenge",
      title: "スーパージャムロールチャレンジ",
      summary:
        "ジャムロールを作って食べ尽くせ！タップで遊べるミニゲームです。",
      status: "ready",
      staticPath: publicPath("/games/super-jam-roll-challenge/index.html"),
    },
    {
      id: "trading-card",
      slug: "trading-card",
      title: "まちサーガトレカ",
      summary: "全18種のトレカを使って遊べる Web ゲームです。",
      status: "coming_soon",
    },
  ],
};
