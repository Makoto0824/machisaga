import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MobileFrame } from "@/components/MobileFrame";
import { RoadmapScreen } from "@/components/other/RoadmapScreen";
import { getRegionRoadmapContent } from "@/data/other";
import { isValidRegion } from "@/data/regions";

type Props = {
  params: Promise<{ region: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region } = await params;
  const content = isValidRegion(region)
    ? getRegionRoadmapContent(region)
    : null;
  if (!content) return {};
  return {
    title: content.title,
    description: content.subtitle,
  };
}

export default async function RoadmapPage({ params }: Props) {
  const { region } = await params;
  if (!isValidRegion(region)) notFound();
  const content = getRegionRoadmapContent(region);
  if (!content) notFound();

  return (
    <MobileFrame>
      <RoadmapScreen content={content} />
    </MobileFrame>
  );
}
