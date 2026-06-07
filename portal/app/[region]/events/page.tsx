import { PlaceholderScreen } from "@/components/PlaceholderScreen";

type Props = {
  params: Promise<{ region: string }>;
};

export default async function EventsPage({ params }: Props) {
  const { region } = await params;
  return (
    <PlaceholderScreen
      regionSlug={region}
      title="イベント"
      description="スタンプラリーなどのイベント情報は準備中です。"
    />
  );
}
