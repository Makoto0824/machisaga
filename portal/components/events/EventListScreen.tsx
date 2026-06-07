"use client";

import { useMemo } from "react";
import { getRegionEvents } from "@/data/events";
import type { EventCategory } from "@/data/events/types";
import { useRegion } from "@/components/RegionProvider";
import { EventCard } from "@/components/events/EventCard";
import {
  EVENT_SECTION_TITLES,
  partitionRegionEvents,
} from "@/lib/events";
import {
  dpLabel,
  dpSubtitle,
  dpTitle,
} from "@/components/ui/theme";

const ACTIVE_SECTIONS: EventCategory[] = ["mobara-city", "asmo", "store"];

function EventSection({
  title,
  events,
  emptyMessage,
}: {
  title: string;
  events: ReturnType<typeof partitionRegionEvents>["activeByCategory"][EventCategory];
  emptyMessage: string;
}) {
  return (
    <section className="mt-6">
      <h2 className="text-sm font-bold text-zinc-800 border-b-2 border-zinc-200 pb-2">
        {title}
      </h2>
      {events.length === 0 ? (
        <p className="text-sm text-zinc-500 mt-3">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-col gap-3 mt-3">
          {events.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function EventListScreen() {
  const region = useRegion();
  const events = getRegionEvents(region.slug);

  const { activeByCategory, ended } = useMemo(
    () => partitionRegionEvents(events, region),
    [events, region]
  );

  return (
    <div className="app-scroll flex-1 flex flex-col px-4 pb-4">
      <header className="dp-screen-header">
        <p className={dpLabel}>イベント</p>
        <h1 className={`${dpTitle} mt-1`}>イベント情報</h1>
        <p className={`${dpSubtitle} mt-1`}>
          茂原市・アスモ、参加店舗のイベント・セール情報です。詳細は各リンク先でご確認ください。
        </p>
      </header>

      {ACTIVE_SECTIONS.map((category) => (
        <EventSection
          key={category}
          title={EVENT_SECTION_TITLES[category]}
          events={activeByCategory[category]}
          emptyMessage="現在掲載中のイベントはありません。"
        />
      ))}

      {ended.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-zinc-600 border-b-2 border-zinc-200 pb-2">
            終了したイベント
          </h2>
          <ul className="flex flex-col gap-3 mt-3">
            {ended.map((event) => (
              <li key={event.id}>
                <EventCard event={event} ended />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
