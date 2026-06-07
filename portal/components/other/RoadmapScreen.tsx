"use client";

import Link from "next/link";
import type { RegionRoadmapContent } from "@/data/other/types";
import { useRegion } from "@/components/RegionProvider";
import { ChanceDefinitionNote } from "@/components/other/ChanceDefinitionNote";
import { OtherParagraphs, OtherSection } from "@/components/other/OtherSection";
import {
  dpBadgeActive,
  dpCardLight,
  dpLabel,
  dpLink,
  dpSubtitle,
  dpTitle,
} from "@/components/ui/theme";

type Props = {
  content: RegionRoadmapContent;
};

function ProgressBar({ value, max }: { value: number; max: number }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="mt-3">
      <div className="h-2.5 rounded-full bg-zinc-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#ffc800] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-zinc-500 mt-1.5 text-right">
        {value} / {max}店（{percent}%）
      </p>
    </div>
  );
}

function FrameworkCard({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: "yellow" | "zinc";
}) {
  const border =
    accent === "yellow" ? "border-l-4 border-[#ffc800]" : "border-l-4 border-zinc-300";
  return (
    <article className={`${dpCardLight} p-4 ${border}`}>
      <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item} className="text-sm text-zinc-600 leading-relaxed pl-1">
            ・{item}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function RoadmapScreen({ content }: Props) {
  const region = useRegion();
  const { currentProgress, regionalGoal, finalGoal, framework } = content;
  const progressPercent = Math.round(
    (currentProgress.partnerStores / currentProgress.phaseTargetStores) * 100
  );

  return (
    <div className="app-scroll flex-1 flex flex-col px-4 pb-8">
      <header className="dp-screen-header">
        <p className={dpLabel}>まちサーガ</p>
        <h1 className={`${dpTitle} mt-1`}>{content.title}</h1>
        <p className={`${dpSubtitle} mt-1`}>{content.subtitle}</p>
      </header>

      <OtherSection title="ビジョン">
        <OtherParagraphs lines={content.visionParagraphs} />
        <ChanceDefinitionNote />
      </OtherSection>

      <OtherSection title="最終目標">
        <article className={`${dpCardLight} p-4 border-l-4 border-[#ffc800]`}>
          <p className="text-base font-bold text-zinc-900">{finalGoal.headline}</p>
          <OtherParagraphs lines={finalGoal.paragraphs} />
          <p className="text-xs text-zinc-500 mt-3 leading-relaxed border-t border-zinc-100 pt-3">
            {finalGoal.directionNote}
          </p>
        </article>
      </OtherSection>

      <OtherSection title="全国展開の道筋">
        <p className="text-sm text-zinc-600 leading-relaxed">
          茂原で実績を積み、地域ごとに連携の形を変えながら広げていく流れです。
        </p>
        <ul className="mt-3 flex flex-col gap-3">
          {content.expansionPhases.map((phase, index) => (
            <li key={phase.id} className={`${dpCardLight} p-4`}>
              <div className="flex items-start justify-between gap-2">
                <span className={dpBadgeActive}>
                  {index + 1}. {phase.label}
                </span>
                <span className="text-xs text-zinc-500 shrink-0">
                  {phase.timeframe}
                </span>
              </div>
              <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                {phase.summary}
              </p>
            </li>
          ))}
        </ul>
      </OtherSection>

      <OtherSection title={framework.sharedTitle}>
        <div className="flex flex-col gap-3">
          <FrameworkCard
            title={framework.shared.title}
            items={framework.shared.items}
            accent="yellow"
          />
          <FrameworkCard
            title={framework.regional.title}
            items={framework.regional.items}
            accent="zinc"
          />
        </div>
      </OtherSection>

      <OtherSection title={regionalGoal.sectionTitle}>
        <article className={`${dpCardLight} p-4 border-l-4 border-[#ffc800]`}>
          <p className="text-sm font-bold text-zinc-900">{regionalGoal.headline}</p>
          <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
            {regionalGoal.description}
          </p>
        </article>
      </OtherSection>

      <OtherSection title="現在の進捗（茂原市）">
        <p className="text-sm font-bold text-zinc-800">
          {currentProgress.headline}（目標 {currentProgress.phaseTargetPercent}
          ％・{currentProgress.phaseTargetStores}店）
        </p>
        <ProgressBar
          value={currentProgress.partnerStores}
          max={currentProgress.phaseTargetStores}
        />
        <ul className="mt-3 flex flex-col gap-1.5 text-sm text-zinc-600">
          <li>協力店舗（目安）：{currentProgress.partnerStores}店</li>
          <li>チャンス参加：{currentProgress.chanceStores}店</li>
          <li>トレカ協力：{currentProgress.tradingCardStores}店</li>
        </ul>
        <p className="text-xs text-zinc-500 mt-2">{currentProgress.note}</p>
        <p className="text-xs text-zinc-500 mt-1">
          Phase 1 達成まであと
          {Math.max(
            0,
            currentProgress.phaseTargetStores - currentProgress.partnerStores
          )}
          店（進捗 {progressPercent}%）
        </p>
      </OtherSection>

      <OtherSection title="目標の考え方（茂原市）">
        <OtherParagraphs lines={content.denominatorParagraphs} />
        <div className={`${dpCardLight} p-4 mt-3 text-center`}>
          <p className="text-xs text-zinc-500">{regionalGoal.denominatorLabel}</p>
          <p className="text-2xl font-bold text-zinc-900 mt-1">
            約{regionalGoal.denominatorCount}店
          </p>
          <p className="text-sm text-zinc-600 mt-2">
            {regionalGoal.goalSummaryLabel}：{regionalGoal.percent}％（
            {regionalGoal.storeCount}店）
          </p>
        </div>
      </OtherSection>

      <OtherSection title="茂原市フェーズ別ロードマップ">
        <ul className="flex flex-col gap-3">
          {content.phases.map((phase) => (
            <li key={phase.id} className={`${dpCardLight} p-4`}>
              <div className="flex items-start justify-between gap-2">
                <span className={dpBadgeActive}>{phase.label}</span>
                <span className="text-xs text-zinc-500 shrink-0">
                  {phase.timeframe}
                </span>
              </div>
              <p className="text-base font-bold text-zinc-900 mt-2">
                {phase.targetPercent}％（{phase.targetStores}店）
              </p>
              <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                {phase.summary}
              </p>
            </li>
          ))}
        </ul>
      </OtherSection>

      <OtherSection title="連携の段階（全国共通の枠組み）">
        <p className="text-sm text-zinc-600 leading-relaxed">
          すべての店舗が同じ形で参加する必要はありません。負荷に応じた4段階を想定し、地域ごとにどこまで進めるかを選びます。
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {content.partnershipLevels.map((level) => (
            <li
              key={level.id}
              className="text-sm border-l-4 border-zinc-200 pl-3 py-1"
            >
              <p className="font-bold text-zinc-900">
                {level.level} {level.title}
                <span className="font-normal text-zinc-500 ml-2">
                  {level.targetRange}
                </span>
              </p>
              <p className="text-zinc-600 mt-0.5">{level.description}</p>
            </li>
          ))}
        </ul>
      </OtherSection>

      <OtherSection title="取り組みの柱">
        <ul className="flex flex-col gap-2">
          {content.initiativesParagraphs.map((line) => (
            <li
              key={line}
              className="text-sm text-zinc-700 pl-3 border-l-4 border-[#ffc800]"
            >
              {line}
            </li>
          ))}
        </ul>
      </OtherSection>

      <OtherSection title="注記">
        <OtherParagraphs lines={content.disclaimerParagraphs} />
        <p className="text-xs text-zinc-400 mt-3">
          最終更新：{content.lastUpdated}
        </p>
      </OtherSection>

      <div className="mt-8 text-center">
        <Link href={`/${region.slug}/other`} className={dpLink}>
          その他・案内に戻る
        </Link>
      </div>
    </div>
  );
}
