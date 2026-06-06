import { getActiveRegion } from "@/lib/region";

function storageKey(): string {
  return `machisaga_chance_test_unlimited_${getActiveRegion().slug}`;
}

/** 開発時、または NEXT_PUBLIC_ENABLE_TEST_TOOLS=true のとき表示 */
export function isTestToolsEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENABLE_TEST_TOOLS === "true"
  );
}

export function isTestUnlimitedEnabled(): boolean {
  if (!isTestToolsEnabled()) return false;
  if (typeof window === "undefined") return false;
  return localStorage.getItem(storageKey()) === "true";
}

export function setTestUnlimitedEnabled(enabled: boolean): void {
  if (!isTestToolsEnabled()) return;
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(), enabled ? "true" : "false");
}

export function toggleTestUnlimited(): boolean {
  const next = !isTestUnlimitedEnabled();
  setTestUnlimitedEnabled(next);
  return next;
}
