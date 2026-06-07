export type GameStatus = "ready" | "coming_soon";

export type GameEntry = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: GameStatus;
  /** public/games/{slug}/ の公開 URL（ready のとき必須） */
  staticPath?: string;
};

export type RegionGamesData = {
  intro: string;
  games: GameEntry[];
};
