"use client";

import Link from "next/link";
import type { RegionTradingCardContent } from "@/data/other/types";
import { useRegion } from "@/components/RegionProvider";
import { OtherLinkCard } from "@/components/other/OtherLinkCard";
import { OtherParagraphs, OtherSection } from "@/components/other/OtherSection";
import { StoreCharacterImage } from "@/components/StoreCharacterImage";
import {
  dpCardLight,
  dpLabel,
  dpLink,
  dpSubtitle,
  dpTitle,
} from "@/components/ui/theme";

type Props = {
  content: RegionTradingCardContent;
};

export function TradingCardScreen({ content }: Props) {
  const region = useRegion();

  return (
    <div className="app-scroll flex-1 flex flex-col px-4 pb-8">
      <header className="dp-screen-header">
        <p className={dpLabel}>まちサーガトレカ</p>
        <h1 className={`${dpTitle} mt-1`}>{content.title}</h1>
        <p className={`${dpSubtitle} mt-1`}>{content.subtitle}</p>
      </header>

      {content.gameNotice && (
        <p
          className={`${dpCardLight} mt-4 px-3 py-2.5 text-sm text-zinc-700 leading-relaxed border-l-4 border-[#ffc800]`}
        >
          {content.gameNotice}
        </p>
      )}

      <OtherSection title="プロジェクトについて">
        <OtherParagraphs lines={content.introParagraphs} />
        <ul className="mt-3 flex flex-col gap-1.5">
          {content.highlights.map((line) => (
            <li
              key={line}
              className="text-sm text-zinc-700 pl-3 border-l-4 border-[#ffc800]"
            >
              {line}
            </li>
          ))}
        </ul>
      </OtherSection>

      {content.externalLinks.length > 0 && (
        <OtherSection title="関連リンク">
          <ul className="flex flex-col gap-3">
            {content.externalLinks.map((link) => (
              <li key={link.id}>
                <OtherLinkCard link={link} />
              </li>
            ))}
          </ul>
        </OtherSection>
      )}

      <OtherSection title={`カード一覧（全${content.cards.length}種）`}>
        <p className="text-xs text-zinc-500 mb-3">
          画像をタップすると拡大表示できます。
        </p>
        <ul className="grid grid-cols-4 gap-x-1 gap-y-1">
          {content.cards.map((card, index) => (
            <li key={card.id} className="min-w-0">
              <StoreCharacterImage
                src={card.image}
                alt={`トレーディングカード ${index + 1}`}
                size="full"
              />
            </li>
          ))}
        </ul>
      </OtherSection>

      <div className="mt-8 text-center">
        <Link href={`/${region.slug}/other`} className={dpLink}>
          その他・案内に戻る
        </Link>
      </div>
    </div>
  );
}
