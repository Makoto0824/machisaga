import type { Metadata } from "next";
import { getRegion } from "@/data/regions";

type Props = {
  children: React.ReactNode;
  params: Promise<{ region: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: slug } = await params;
  const region = getRegion(slug);
  if (!region) return {};
  return {
    title: region.title,
    description: region.description,
  };
}

export default function ChanceLayout({ children }: Props) {
  return children;
}
