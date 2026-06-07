"use client";

import Link from "next/link";
import type { RegionOtherContent, RegionRoadmapContent } from "@/data/other/types";
import { useRegion } from "@/components/RegionProvider";
import { OtherAccordion } from "@/components/other/OtherAccordion";
import { ChanceDefinitionNote } from "@/components/other/ChanceDefinitionNote";
import { OtherLinkCard } from "@/components/other/OtherLinkCard";
import { OtherParagraphs, OtherSection } from "@/components/other/OtherSection";
import {
  dpCardLight,
  dpLabel,
  dpLink,
  dpSubtitle,
  dpTitle,
} from "@/components/ui/theme";

type Props = {
  content: RegionOtherContent;
  roadmap?: RegionRoadmapContent | null;
};

export function OtherScreen({ content, roadmap }: Props) {
  const region = useRegion();

  return (
    <div className="app-scroll flex-1 flex flex-col px-4 pb-8">
      <header className="dp-screen-header">
        <p className={dpLabel}>案内</p>
        <h1 className={`${dpTitle} mt-1`}>その他</h1>
        <p className={`${dpSubtitle} mt-1`}>
          まちサーガについて、各種案内・規約を掲載しています。
        </p>
      </header>

      <OtherSection title={content.aboutTitle}>
        <OtherParagraphs lines={content.aboutParagraphs} />
        <ChanceDefinitionNote />
      </OtherSection>

      {content.snsLinks.length > 0 && (
        <OtherSection title="SNS">
          <ul className="flex flex-col gap-3">
            {content.snsLinks.map((link) => (
              <li key={link.id}>
                <OtherLinkCard link={link} />
              </li>
            ))}
          </ul>
        </OtherSection>
      )}

      <OtherSection title={content.historyTitle}>
        <OtherParagraphs lines={content.historyParagraphs} />
      </OtherSection>

      {roadmap && (
        <OtherSection title={roadmap.title}>
          <article className={`${dpCardLight} p-4`}>
            <p className="text-sm font-bold text-zinc-900">
              {roadmap.finalGoal.headline}
            </p>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              長期目標（茂原市）：{roadmap.regionalGoal.headline}
            </p>
            <p className="text-sm text-zinc-800 font-bold mt-3">
              現在：協力店舗 約{roadmap.currentProgress.partnerStores}店 /
              Phase 1 目標 {roadmap.currentProgress.phaseTargetStores}店（
              {roadmap.currentProgress.phaseTargetPercent}％）
            </p>
            <Link
              href={`/${region.slug}/other/roadmap`}
              className={`${dpLink} mt-3 inline-block`}
            >
              ロードマップの詳細を見る
            </Link>
          </article>
        </OtherSection>
      )}

      <OtherSection title="まちサーガトレカ">
        <article className={`${dpCardLight} p-4`}>
          <h3 className="text-base font-bold text-zinc-900">
            まちの勇者たちをトレカ化
          </h3>
          <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
            茂原市内の協力店舗・施設がキャラクターになった全18種のトレーディングカード。Webゲームは鋭意制作中です。詳細は紹介ページをご覧ください。
          </p>
          <Link
            href={`/${region.slug}/other/trading-cards`}
            className={`${dpLink} mt-3 inline-block`}
          >
            まちサーガトレカの紹介を見る
          </Link>
        </article>
      </OtherSection>

      <section className="mt-6">
        <h2 className="text-sm font-bold text-zinc-800 border-b-2 border-zinc-200 pb-2">
          ご案内
        </h2>

        <OtherAccordion title="使い方・FAQ">
          <ul className="flex flex-col gap-3">
            {content.faq.map((item) => (
              <li key={item.id}>
                <h3 className="text-sm font-bold text-zinc-900">
                  {item.question}
                </h3>
                <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                  {item.answer}
                </p>
              </li>
            ))}
          </ul>
        </OtherAccordion>

        <OtherAccordion title={content.contactTitle}>
          <OtherParagraphs lines={content.contactParagraphs} />
        </OtherAccordion>

        <OtherAccordion title={content.privacyTitle} id="privacy">
          <OtherParagraphs lines={content.privacyParagraphs} />
        </OtherAccordion>

        <OtherAccordion title={content.termsTitle} id="terms">
          <OtherParagraphs lines={content.termsParagraphs} />
        </OtherAccordion>
      </section>

      <footer className="mt-8 pt-4 border-t border-zinc-200 text-center">
        {content.operatorLines.map((line) => (
          <p key={line} className="text-xs text-zinc-500">
            {line}
          </p>
        ))}
        <p className="text-xs text-zinc-400 mt-2">
          最終更新：{content.lastUpdated}
        </p>
      </footer>
    </div>
  );
}
