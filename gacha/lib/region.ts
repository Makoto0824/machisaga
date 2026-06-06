import type { RegionConfig } from "@/data/types";

let activeRegion: RegionConfig | null = null;

export function setActiveRegion(region: RegionConfig): void {
  activeRegion = region;
}

export function getActiveRegion(): RegionConfig {
  if (!activeRegion) {
    throw new Error("Region is not set. Use RegionProvider first.");
  }
  return activeRegion;
}
