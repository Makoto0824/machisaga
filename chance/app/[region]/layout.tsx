import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RegionProvider } from "@/components/RegionProvider";
import {
  REGION_SLUGS,
  getRegion,
  isValidRegion,
} from "@/data/regions";

type Props = {
  children: React.ReactNode;
  params: Promise<{ region: string }>;
};

export function generateStaticParams() {
  return REGION_SLUGS.map((region) => ({ region }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: slug } = await params;
  const region = getRegion(slug);
  if (!region) return {};
  return {
    title: region.title,
    description: region.description,
  };
}

export default async function RegionLayout({ children, params }: Props) {
  const { region: slug } = await params;
  if (!isValidRegion(slug)) notFound();
  const region = getRegion(slug)!;

  return <RegionProvider region={region}>{children}</RegionProvider>;
}
