import { notFound, redirect } from "next/navigation";
import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { getGameBySlug } from "@/data/games";
import { isValidRegion } from "@/data/regions";

type Props = {
  params: Promise<{ region: string; gameSlug: string }>;
};

export default async function GameLaunchPage({ params }: Props) {
  const { region, gameSlug } = await params;
  if (!isValidRegion(region)) notFound();

  const game = getGameBySlug(region, gameSlug);
  if (!game) notFound();

  if (game.status === "ready" && game.staticPath) {
    redirect(game.staticPath);
  }

  return (
    <PlaceholderScreen
      title={game.title}
      description={`${game.summary} 公開まで今しばらくお待ちください。`}
    />
  );
}
