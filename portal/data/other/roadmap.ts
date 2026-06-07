import type { RegionRoadmapContent } from "@/data/other/types";

export const mobaraRoadmapContent: RegionRoadmapContent = {
  title: "これからのまちサーガ",
  subtitle: "茂原から始まり、地域ごとに広がる地域共創のロードマップ",
  visionParagraphs: [
    "まちサーガは、千葉県茂原市から始まった地域共創プロジェクトです。",
    "ゲーム、チャンス、トレカ、イベントなどを通じて、まちのお店や人の魅力を伝え、地域への愛着を育てることを目指しています。",
  ],
  finalGoal: {
    headline:
      "茂原で培った実績を土台に、全国の地域でまちサーガを展開する",
    paragraphs: [
      "最終的には、各地域の店・事業者・人と連携し、地域ごとに特色ある取り組みを重ねながら、まちサーガの輪を広げていきます。",
      "理想として、各まちの来店型事業者との幅広い連携を目指します。ただし100％を数値目標に据えるのではなく、地域ごとの現実的な目標（例：連携可能店舗の5〜25％）で進めます。",
      "茂原市はその最初の実証の場（ラボ）です。ここで得た運用・店舗説得・コンテンツづくりの知見を、次の地域へ引き継ぎます。",
    ],
    directionNote:
      "「すべての事業者と連携する」はプロジェクトの方向性です。達成度は地域ごとのロードマップと進捗で測ります。",
  },
  expansionPhases: [
    {
      id: "expand-1",
      label: "茂原で実証",
      timeframe: "現在〜",
      summary:
        "チャンス・トレカ・イベントを運用し、参加の型（L1〜L4）と数値目標を確立。店舗・市・学校との協働モデルを茂原で完成させます。",
    },
    {
      id: "expand-2",
      label: "第2地域パイロット",
      timeframe: "茂原 Phase 2 前後",
      summary:
        "茂原の playbook を基に、類似規模の地域で小さく開始（掲載＋コンテンツ、またはチャンス数店）。地域の主役（商店街・市等）と共同運営を試します。",
    },
    {
      id: "expand-3",
      label: "多地域展開",
      timeframe: "中長期",
      summary:
        "地域ごとに連携の組み合わせを変えながら展開。A地域はトレカ中心、B地域はチャンス中心など、まちの強みに合わせたカスタマイズを行います。",
    },
    {
      id: "expand-4",
      label: "地域間のつながり",
      timeframe: "将来",
      summary:
        "各地域のキャラ・トレカ・イベントが相互に触れ合うネットワークへ。合同企画や交流を通じ、「茂原発」の地域共創が全国のまちに広がる状態を目指します。",
    },
  ],
  framework: {
    sharedTitle: "全国共通の骨格",
    shared: {
      id: "shared",
      title: "どの地域でも揃える",
      items: [
        "まちサーガのブランドと世界観（まちの勇者・地域共創）",
        "アプリの基本体験（チャンスのルール感、案内・規約の品質）",
        "連携の段階（L1掲載 → L2コンテンツ → L3来店施策 → L4共創）",
        "店舗オンボーディングの手順と運用の最低基準",
      ],
    },
    regionalTitle: "地域ごとに変える",
    regional: {
      id: "regional",
      title: "まちの個性に合わせる",
      items: [
        "参加店舗・クーポン内容・キャラクター／トレカの有無",
        "主施策の組み合わせ（チャンス／トレカ／ゲーム／イベント）",
        "連携先（市・商店街・学校・施設など）とイベント設計",
        "目標店舗数・達成率の分母（人口・商業密度に応じて設定）",
      ],
    },
  },
  regionalGoal: {
    sectionTitle: "茂原市の長期目標",
    headline: "来店型店舗400店のうち100店（25%）と連携する",
    percent: 25,
    storeCount: 100,
    denominatorLabel: "まちサーガ連携可能な来店型店舗",
    denominatorCount: 400,
    description:
      "商店街・駅前・市内商業エリアを中心に、来店型で協力可能な店舗を想定した茂原市の目標です。製造・医療・B2Bなど、性質上参加が難しい事業所は分母に含めません。",
    goalSummaryLabel: "長期目標",
  },
  currentProgress: {
    headline: "Phase 1 に向けて",
    partnerStores: 18,
    chanceStores: 3,
    tradingCardStores: 18,
    phaseTargetPercent: 5,
    phaseTargetStores: 20,
    note: "トレカ事業協力18店、チャンス参加3店。チャンス参加店舗はトレカ協力店舗と重複があります。",
  },
  denominatorParagraphs: [
    "茂原市には約3,300の事業所がありますが、まちサーガの「連携」とは性質が異なる業種も多く含まれます。",
    "小売・飲食・生活サービスなど、来店型でまちの魅力を伝えやすい店舗を約400店と想定し、達成率の分母としています。",
    "この数字は経済センサス等を参考にした目安であり、エリアや業態の整理に応じて見直す場合があります。",
  ],
  phases: [
    {
      id: "phase-1",
      label: "Phase 1",
      targetPercent: 5,
      targetStores: 20,
      timeframe: "〜1年",
      summary:
        "動いている証明。チャンス参加の拡大と、トレカ・掲載による協力店舗20店を目指します。",
    },
    {
      id: "phase-2",
      label: "Phase 2",
      targetPercent: 10,
      targetStores: 40,
      timeframe: "2〜3年",
      summary:
        "市内で名前が通る規模。イベント・ゲーム連動を本格化し、来店のきっかけを増やします。",
    },
    {
      id: "phase-3",
      label: "Phase 3",
      targetPercent: 15,
      targetStores: 60,
      timeframe: "3〜5年",
      summary:
        "若者・来茂者が「まちサーガで回る」選択肢になる密度を目指します。",
    },
    {
      id: "phase-4",
      label: "Phase 4",
      targetPercent: 25,
      targetStores: 100,
      timeframe: "5年〜",
      summary:
        "茂原の商店・飲食文化の一部として、地域共創の標準インフラに近い状態を目指します。第2地域展開の準備も整えます。",
    },
  ],
  partnershipLevels: [
    {
      id: "l1",
      level: "L1",
      title: "掲載",
      description: "店舗紹介・イベント情報の掲載",
      targetRange: "40〜60店（10〜15%）",
    },
    {
      id: "l2",
      level: "L2",
      title: "コンテンツ",
      description: "トレカ・キャラクター・SNS等での魅力発信",
      targetRange: "30〜40店（8〜10%）",
    },
    {
      id: "l3",
      level: "L3",
      title: "来店施策",
      description: "チャンス・クーポンなど来店を促す仕組みへの参加",
      targetRange: "15〜25店（4〜6%）",
    },
    {
      id: "l4",
      level: "L4",
      title: "共創",
      description: "高校取材・市・団体との共同企画・大型イベント",
      targetRange: "10店前後",
    },
  ],
  initiativesParagraphs: [
    "チャンス — 参加店舗の特典が当たる抽選。店舗拡大と運用の安定化",
    "まちサーガトレカ — 協力店舗のキャラクター化と配布・交流イベント",
    "イベント掲載 — 店舗・公式・市関連の情報を一箇所に",
    "ゲーム・その他コンテンツ — まちを題材にした体験の追加",
    "基盤整備 — 本番データ管理（Supabase）、LIFF 等の段階的導入",
  ],
  disclaimerParagraphs: [
    "本ページの数値・時期は目標であり、協力店舗の増減や運営状況により変更する場合があります。",
    "第2地域以降の展開時期・対象地域は、茂原での実績と体制を踏まえて決定します。",
    "店舗・事業者の皆さまのご参加は任意です。内容・条件は店舗ごとに異なります。",
  ],
  lastUpdated: "2026年6月7日",
};
