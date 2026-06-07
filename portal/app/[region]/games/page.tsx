import { PlaceholderScreen } from "@/components/PlaceholderScreen";

type Props = {
  params: Promise<{ region: string }>;
};

export default async function GamesPage({ params }: Props) {
  const { region } = await params;
  return (
    <PlaceholderScreen
      regionSlug={region}
      title="ゲーム"
      description="まちサーガのミニゲームは準備中です。"
    />
  );
}
