import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MobileFrame } from "@/components/MobileFrame";
import { TradingCardScreen } from "@/components/other/TradingCardScreen";
import { getRegionTradingCardContent } from "@/data/other";
import { isValidRegion } from "@/data/regions";

type Props = {
  params: Promise<{ region: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region } = await params;
  const content = isValidRegion(region)
    ? getRegionTradingCardContent(region)
    : null;
  if (!content) return {};
  return {
    title: content.title,
    description: content.subtitle,
  };
}

export default async function TradingCardsPage({ params }: Props) {
  const { region } = await params;
  if (!isValidRegion(region)) notFound();
  const content = getRegionTradingCardContent(region);
  if (!content) notFound();

  return (
    <MobileFrame>
      <TradingCardScreen content={content} />
    </MobileFrame>
  );
}
