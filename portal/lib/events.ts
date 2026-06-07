import type { RegionConfig } from "@/data/types";
import type { EventCategory, RegionEvent } from "@/data/events/types";

export const EVENT_SECTION_TITLES: Record<EventCategory, string> = {
  "mobara-city": "茂原市のイベント",
  asmo: "茂原アスモのイベント",
  store: "参加店舗のイベント",
};

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  "mobara-city": "茂原市",
  asmo: "茂原アスモ",
  store: "参加店舗",
};

const ACTIVE_CATEGORIES: EventCategory[] = [
  "mobara-city",
  "asmo",
  "store",
];

export type EventWithStoreName = RegionEvent & {
  storeName?: string;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isEventEnded(event: RegionEvent, today = new Date()): boolean {
  return startOfDay(parseDate(event.endDate)) < startOfDay(today);
}

export function formatEventDate(dateStr: string): string {
  const d = parseDate(dateStr);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}（${weekdays[d.getDay()]}）`;
}

export function formatEventDateRange(event: RegionEvent): string {
  if (event.startDate === event.endDate) {
    return formatEventDate(event.startDate);
  }
  return `${formatEventDate(event.startDate)} 〜 ${formatEventDate(event.endDate)}`;
}

function resolveStoreName(
  region: RegionConfig,
  event: RegionEvent
): string | undefined {
  if (!event.storeId) return undefined;
  return region.stores.find((s) => s.id === event.storeId)?.name;
}

function attachStoreName(
  region: RegionConfig,
  event: RegionEvent
): EventWithStoreName {
  const storeName = resolveStoreName(region, event);
  return storeName ? { ...event, storeName } : event;
}

function sortByStartAsc(a: RegionEvent, b: RegionEvent): number {
  return parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime();
}

function sortByEndDesc(a: RegionEvent, b: RegionEvent): number {
  return parseDate(b.endDate).getTime() - parseDate(a.endDate).getTime();
}

export function partitionRegionEvents(
  events: RegionEvent[],
  region: RegionConfig,
  today = new Date()
): {
  activeByCategory: Record<EventCategory, EventWithStoreName[]>;
  ended: EventWithStoreName[];
} {
  const visible = events.filter((e) => e.isActive);
  const active: RegionEvent[] = [];
  const ended: RegionEvent[] = [];

  for (const event of visible) {
    if (isEventEnded(event, today)) {
      ended.push(event);
    } else {
      active.push(event);
    }
  }

  const activeByCategory = ACTIVE_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = active
        .filter((e) => e.category === category)
        .sort(sortByStartAsc)
        .map((e) => attachStoreName(region, e));
      return acc;
    },
    {} as Record<EventCategory, EventWithStoreName[]>
  );

  return {
    activeByCategory,
    ended: ended.sort(sortByEndDesc).map((e) => attachStoreName(region, e)),
  };
}
