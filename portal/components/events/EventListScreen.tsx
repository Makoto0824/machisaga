"use client";

import { useMemo } from "react";
import { getRegionEventsData } from "@/data/events";
import type { EventLinkCategory } from "@/data/events/types";
import { useRegion } from "@/components/RegionProvider";
import { EventLinkCard } from "@/components/events/EventLinkCard";
import { StoreEventCard } from "@/components/events/StoreEventCard";
import {
  ENDED_SECTION_TITLE,
  LINK_SECTION_TITLES,
  STORE_SECTION_TITLE,
  partitionRegionEventsData,
} from "@/lib/events";
import { dpLabel, dpSubtitle, dpTitle } from "@/components/ui/theme";

const LINK_SECTIONS: EventLinkCategory[] = ["mobara-city", "asmo"];

function LinkSection({
  title,
  links,
}: {
  title: string;
  links: ReturnType<typeof partitionRegionEventsData>["linksByCategory"][EventLinkCategory];
}) {
  if (links.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-sm font-bold text-zinc-800 border-b-2 border-zinc-200 pb-2">
        {title}
      </h2>
      <ul className="flex flex-col gap-3 mt-3">
        {links.map((link) => (
          <li key={link.id}>
            <EventLinkCard link={link} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function EventListScreen() {
  const region = useRegion();
  const data = getRegionEventsData(region.slug);

  const { linksByCategory, activeStores, endedStores } = useMemo(
    () => partitionRegionEventsData(data, region),
    [data, region]
  );

  return (
    <div className="app-scroll flex-1 flex flex-col px-4 pb-4">
      <header className="dp-screen-header">
        <p className={dpLabel}>イベント</p>
        <h1 className={`${dpTitle} mt-1`}>イベント情報</h1>
        <p className={`${dpSubtitle} mt-1`}>
          参加店舗のセール情報と、茂原市・アスモの公式イベント情報への案内です。
        </p>
      </header>

      <section className="mt-4">
        <h2 className="text-sm font-bold text-zinc-800 border-b-2 border-zinc-200 pb-2">
          {STORE_SECTION_TITLE}
        </h2>
        {activeStores.length === 0 ? (
          <p className="text-sm text-zinc-500 mt-3">
            現在掲載中の店舗イベントはありません。
          </p>
        ) : (
          <ul className="flex flex-col gap-3 mt-3">
            {activeStores.map((event) => (
              <li key={event.id}>
                <StoreEventCard event={event} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {LINK_SECTIONS.map((category) => (
        <LinkSection
          key={category}
          title={LINK_SECTION_TITLES[category]}
          links={linksByCategory[category]}
        />
      ))}

      {endedStores.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-zinc-600 border-b-2 border-zinc-200 pb-2">
            {ENDED_SECTION_TITLE}
          </h2>
          <ul className="flex flex-col gap-3 mt-3">
            {endedStores.map((event) => (
              <li key={event.id}>
                <StoreEventCard event={event} ended />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
