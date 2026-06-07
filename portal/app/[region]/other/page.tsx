import { PlaceholderScreen } from "@/components/PlaceholderScreen";

type Props = {
  params: Promise<{ region: string }>;
};

export default async function OtherPage({ params }: Props) {
  const { region } = await params;
  return (
    <PlaceholderScreen
      regionSlug={region}
      title="その他"
      description="案内・リンク集は準備中です。"
    />
  );
}
