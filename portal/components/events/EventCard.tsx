import type { EventWithStoreName } from "@/lib/events";
import {
  EVENT_CATEGORY_LABELS,
  formatEventDateRange,
} from "@/lib/events";
import {
  dpBadgeActive,
  dpBadgeMuted,
  dpCardLight,
  dpLink,
} from "@/components/ui/theme";

type Props = {
  event: EventWithStoreName;
  ended?: boolean;
};

export function EventCard({ event, ended = false }: Props) {
  const categoryLabel = EVENT_CATEGORY_LABELS[event.category];

  return (
    <article
      className={`${dpCardLight} p-4 ${ended ? "opacity-70" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={ended ? dpBadgeMuted : dpBadgeActive}>
          {categoryLabel}
        </span>
        {event.storeName && (
          <span className="text-[10px] font-bold text-zinc-600">
            {event.storeName}
          </span>
        )}
        {ended && (
          <span className={dpBadgeMuted}>終了</span>
        )}
      </div>

      <p className="text-xs text-zinc-500 mt-2">{formatEventDateRange(event)}</p>

      <h2 className="text-base font-bold text-zinc-900 mt-1">{event.title}</h2>

      {event.venue && (
        <p className="text-xs text-zinc-500 mt-1">{event.venue}</p>
      )}

      <p className="text-sm text-zinc-600 mt-2 leading-relaxed">{event.summary}</p>

      <a
        href={event.detailUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${dpLink} mt-3`}
      >
        詳細を見る
      </a>
    </article>
  );
}
