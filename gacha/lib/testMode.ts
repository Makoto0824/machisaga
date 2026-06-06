import { getActiveRegion } from "@/lib/region";

function storageKey(): string {
  return `machisaga_gacha_test_unlimited_${getActiveRegion().slug}`;
}

export function isTestUnlimitedEnabled(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  if (typeof window === "undefined") return false;
  return localStorage.getItem(storageKey()) === "true";
}

export function setTestUnlimitedEnabled(enabled: boolean): void {
  if (process.env.NODE_ENV !== "development") return;
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(), enabled ? "true" : "false");
}

export function toggleTestUnlimited(): boolean {
  const next = !isTestUnlimitedEnabled();
  setTestUnlimitedEnabled(next);
  return next;
}
