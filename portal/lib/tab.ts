import type { Screen } from "@/components/BottomNav";

const VALID_TABS: Screen[] = ["chance", "coupons", "stores"];

export function parseTabParam(value: string | null): Screen {
  if (value && (VALID_TABS as string[]).includes(value)) {
    return value as Screen;
  }
  return "chance";
}

/** タブ切り替えを URL に反映（リッチメニュー・共有用） */
export function replaceTabInUrl(screen: Screen): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (screen === "chance") {
    url.searchParams.delete("tab");
  } else {
    url.searchParams.set("tab", screen);
  }

  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(null, "", next);
}
