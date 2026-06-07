import { notFound, redirect } from "next/navigation";
import { isValidRegion } from "@/data/regions";

type Props = {
  params: Promise<{ region: string }>;
};

export default async function RegionIndex({ params }: Props) {
  const { region } = await params;
  if (!isValidRegion(region)) notFound();
  redirect(`/${region}/chance`);
}
