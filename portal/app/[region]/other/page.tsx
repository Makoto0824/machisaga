import { notFound } from "next/navigation";
import { MobileFrame } from "@/components/MobileFrame";
import { OtherScreen } from "@/components/other/OtherScreen";
import { getRegionOtherContent, getRegionRoadmapContent } from "@/data/other";
import { isValidRegion } from "@/data/regions";

type Props = {
  params: Promise<{ region: string }>;
};

export default async function OtherPage({ params }: Props) {
  const { region } = await params;
  if (!isValidRegion(region)) notFound();
  const content = getRegionOtherContent(region);
  if (!content) notFound();
  const roadmap = getRegionRoadmapContent(region);

  return (
    <MobileFrame>
      <OtherScreen content={content} roadmap={roadmap} />
    </MobileFrame>
  );
}
