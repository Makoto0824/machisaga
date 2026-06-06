"use client";

import { createContext, useContext, useEffect } from "react";
import type { RegionConfig } from "@/data/types";
import { setActiveRegion } from "@/lib/region";

const RegionContext = createContext<RegionConfig | null>(null);

type Props = {
  region: RegionConfig;
  children: React.ReactNode;
};

export function RegionProvider({ region, children }: Props) {
  useEffect(() => {
    setActiveRegion(region);
  }, [region]);

  // 初回レンダー（useEffect 前）でも lib が参照できるよう同期的にセット
  setActiveRegion(region);

  return (
    <RegionContext.Provider value={region}>{children}</RegionContext.Provider>
  );
}

export function useRegion(): RegionConfig {
  const region = useContext(RegionContext);
  if (!region) {
    throw new Error("useRegion must be used within RegionProvider");
  }
  return region;
}
