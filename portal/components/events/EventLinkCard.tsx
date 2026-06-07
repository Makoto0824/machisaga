import type { EventLinkRef } from "@/data/events/types";
import { dpCardLight, dpLink } from "@/components/ui/theme";

type Props = {
  link: EventLinkRef;
};

export function EventLinkCard({ link }: Props) {
  return (
    <article className={`${dpCardLight} p-4`}>
      <h2 className="text-base font-bold text-zinc-900">{link.title}</h2>
      <p className="text-sm text-zinc-600 mt-2 leading-relaxed">{link.summary}</p>
      <a
        href={link.detailUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${dpLink} mt-3`}
      >
        イベント情報を見る
      </a>
    </article>
  );
}
