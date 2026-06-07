import type { RegionConfig } from "@/data/types";
import type {
  EventLinkCategory,
  EventLinkRef,
  RegionEventsData,
  StoreEvent,
} from "@/data/events/types";

export const LINK_SECTION_TITLES: Record<EventLinkCategory, string> = {
  "mobara-city": "茂原市のイベント情報",
  asmo: "茂原アスモのイベント情報",
};

export const STORE_SECTION_TITLE = "参加店舗のイベント";
export const ENDED_SECTION_TITLE = "終了したイベント";

export type StoreEventWithName = StoreEvent & {
  storeName?: string;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isStoreEventEnded(event: StoreEvent, today = new Date()): boolean {
  return startOfDay(parseDate(event.endDate)) < startOfDay(today);
}

export function formatEventDate(dateStr: string): string {
  const d = parseDate(dateStr);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}（${weekdays[d.getDay()]}）`;
}

export function formatStoreEventDateRange(event: StoreEvent): string {
  if (event.startDate === event.endDate) {
    return formatEventDate(event.startDate);
  }
  return `${formatEventDate(event.startDate)} 〜 ${formatEventDate(event.endDate)}`;
}

function resolveStoreName(
  region: RegionConfig,
  event: StoreEvent
): string | undefined {
  return region.stores.find((s) => s.id === event.storeId)?.name;
}

function attachStoreName(
  region: RegionConfig,
  event: StoreEvent
): StoreEventWithName {
  const storeName = resolveStoreName(region, event);
  return storeName ? { ...event, storeName } : event;
}

function sortByStartAsc(a: StoreEvent, b: StoreEvent): number {
  return parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime();
}

function sortByEndDesc(a: StoreEvent, b: StoreEvent): number {
  return parseDate(b.endDate).getTime() - parseDate(a.endDate).getTime();
}

export function partitionRegionEventsData(
  data: RegionEventsData,
  region: RegionConfig,
  today = new Date()
): {
  linksByCategory: Record<EventLinkCategory, EventLinkRef[]>;
  activeStores: StoreEventWithName[];
  endedStores: StoreEventWithName[];
} {
  const linksByCategory: Record<EventLinkCategory, EventLinkRef[]> = {
    "mobara-city": data.links.filter(
      (l) => l.isActive && l.category === "mobara-city"
    ),
    asmo: data.links.filter((l) => l.isActive && l.category === "asmo"),
  };

  const visibleStores = data.storeEvents.filter((e) => e.isActive);
  const activeStores: StoreEvent[] = [];
  const endedStores: StoreEvent[] = [];

  for (const event of visibleStores) {
    if (isStoreEventEnded(event, today)) {
      endedStores.push(event);
    } else {
      activeStores.push(event);
    }
  }

  return {
    linksByCategory,
    activeStores: activeStores
      .sort(sortByStartAsc)
      .map((e) => attachStoreName(region, e)),
    endedStores: endedStores
      .sort(sortByEndDesc)
      .map((e) => attachStoreName(region, e)),
  };
}
