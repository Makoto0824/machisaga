const STORAGE_KEY = "machisaga_gacha_test_unlimited";

export function isTestUnlimitedEnabled(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function setTestUnlimitedEnabled(enabled: boolean): void {
  if (process.env.NODE_ENV !== "development") return;
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
}

export function toggleTestUnlimited(): boolean {
  const next = !isTestUnlimitedEnabled();
  setTestUnlimitedEnabled(next);
  return next;
}
