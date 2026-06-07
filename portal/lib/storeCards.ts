import type { RegionConfig } from "@/data/types";

export function getStoreCardImage(
  region: RegionConfig,
  storeId: string
): string | null {
  return region.storeCardImages[storeId] ?? null;
}
