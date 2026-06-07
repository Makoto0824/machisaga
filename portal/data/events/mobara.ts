import type { RegionEventsData } from "@/data/events/types";

/**
 * 茂原のイベント情報（Git で手動更新）。
 * 市・アスモは公式サイトへの紹介のみ。参加店舗だけ個別掲載。
 */
export const mobaraEventsData: RegionEventsData = {
  links: [
    {
      id: "maruchiba-mobara",
      category: "mobara-city",
      title: "ちば観光ナビ（茂原市のイベント）",
      summary:
        "千葉県公式観光サイトで、茂原市で開催されるイベントを検索・確認できます。",
      detailUrl: "https://maruchiba.jp/event/index_1_2_32.html",
      isActive: true,
    },
    {
      id: "asmo-events",
      category: "asmo",
      title: "茂原ショッピングプラザアスモ イベント情報",
      summary:
        "館内のイベント・キャンペーン・セール情報は公式サイトでご確認ください。",
      detailUrl: "https://asmo-sc.com/event/",
      isActive: true,
    },
  ],
  storeEvents: [
    {
      id: "store-kurofune-summer-sweets",
      storeId: "store-kurofune",
      title: "夏限定スイーツフェア",
      summary:
        "【仮】季節限定のジャムロールや冷たいスイーツをご用意。詳細は店舗へお問い合わせください。",
      startDate: "2026-06-01",
      endDate: "2026-08-31",
      venue: "茂原黒船",
      detailUrl: "https://maps.app.goo.gl/jnwC2n9CkTXoMEzW9",
      isActive: true,
    },
    {
      id: "store-laughin-burger-week",
      storeId: "store-laughin",
      title: "バーガーキッチンウィーク",
      summary:
        "【仮】期間中、おすすめバーガーセットを特別価格で提供予定。詳細は店舗SNS等で告知。",
      startDate: "2026-06-10",
      endDate: "2026-06-20",
      venue: "バーガーキッチン ラフィン",
      detailUrl: "https://maps.app.goo.gl/HmMZdxZqU7AaPze48",
      isActive: true,
    },
    {
      id: "store-reve-takeout-sale",
      storeId: "store-reve",
      title: "テイクアウトスイーツセール",
      summary:
        "【仮】テイクアウトスイーツの期間限定割引企画。詳細は店舗へお問い合わせください。",
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      venue: "創作スイーツ＆フレンチ レーヴ",
      detailUrl: "https://maps.app.goo.gl/qcVYn9hGYGA7jvvE6",
      isActive: true,
    },
    {
      id: "store-kurofune-spring-fair",
      storeId: "store-kurofune",
      title: "春のスイーツフェア",
      summary: "【仮】春限定メニューをご提供しました。",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      venue: "茂原黒船",
      detailUrl: "https://maps.app.goo.gl/jnwC2n9CkTXoMEzW9",
      isActive: true,
    },
  ],
};
