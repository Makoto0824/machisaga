import type { RegionEventList } from "@/data/events/types";

/**
 * 茂原のイベント情報（Git で手動更新）。
 * 詳細は各 detailUrl へリンク。本文の転載はしない。
 */
export const mobaraEvents: RegionEventList = [
  // --- 茂原市（ちば観光ナビ等を参考） ---
  {
    id: "mobara-tanabata-2026",
    category: "mobara-city",
    title: "第72回 茂原七夕まつり",
    summary:
      "茂原駅周辺で開催される夏の一大イベント。もばら阿波おどりやYOSAKOI、華やかな七夕飾りなど。",
    startDate: "2026-07-24",
    endDate: "2026-07-26",
    venue: "茂原駅周辺",
    detailUrl: "https://maruchiba.jp/event/detail_12959.html",
    isActive: true,
  },
  {
    id: "mobara-ajisai-2026",
    category: "mobara-city",
    title: "季節の花「あじさい」／服部農園あじさい屋敷",
    summary:
      "約250品種・1万株以上のあじさいが咲くシーズンイベント。6月上旬〜7月上旬が見頃。",
    startDate: "2026-06-01",
    endDate: "2026-07-10",
    venue: "服部農園あじさい屋敷（茂原市）",
    detailUrl: "https://maruchiba.jp/event/detail_13801.html",
    isActive: true,
  },
  {
    id: "chiba-shake-festival-2026",
    category: "mobara-city",
    title: "第8回 千葉 生シェイク祭り2026",
    summary:
      "千葉県内64店舗で開催。茂原市の参加店舗でもプレミアムシェイクが楽しめます。",
    startDate: "2026-06-01",
    endDate: "2026-10-31",
    venue: "千葉県内各店舗",
    detailUrl: "https://maruchiba.jp/event/detail_13031.html",
    isActive: true,
  },
  {
    id: "mobara-city-events-index",
    category: "mobara-city",
    title: "茂原市のイベント一覧（ちば観光ナビ）",
    summary:
      "茂原市で開催されるイベントを公式観光サイトで検索・確認できます。",
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    detailUrl: "https://maruchiba.jp/event/index_1_2_32.html",
    isActive: true,
  },

  // --- 茂原アスモ（asmo-sc.com/event/ を参考） ---
  {
    id: "asmo-fuku-marche-2026",
    category: "asmo",
    title: "第11回 福 FUKU まるしぇ",
    summary:
      "アスモ館内で開催されるマルシェ。地元の出店や催しをお楽しみください。",
    startDate: "2026-06-27",
    endDate: "2026-06-28",
    venue: "茂原ショッピングプラザアスモ",
    detailUrl: "https://asmo-sc.com/event/",
    isActive: true,
  },
  {
    id: "asmo-gogo-day-2026-06",
    category: "asmo",
    title: "アスモ GOGO DAY",
    summary: "アスモ館内のお得な企画日。詳細はアスモ公式のイベント情報をご確認ください。",
    startDate: "2026-06-15",
    endDate: "2026-06-15",
    venue: "茂原ショッピングプラザアスモ",
    detailUrl: "https://asmo-sc.com/event/",
    isActive: true,
  },
  {
    id: "asmo-softbank-opening-2026",
    category: "asmo",
    title: "SoftBank × ケーズデンキ オープニングイベント",
    summary:
      "6月中旬のオープニング記念イベント。緊急5倍ポイントセールなども開催予定。",
    startDate: "2026-06-11",
    endDate: "2026-06-14",
    venue: "茂原ショッピングプラザアスモ",
    detailUrl: "https://asmo-sc.com/event/",
    isActive: true,
  },
  {
    id: "asmo-events-index",
    category: "asmo",
    title: "アスモ イベント情報（一覧）",
    summary:
      "今月の館内イベント・キャンペーンを公式サイトでご確認いただけます。",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    venue: "茂原ショッピングプラザアスモ",
    detailUrl: "https://asmo-sc.com/event/",
    isActive: true,
  },

  // --- 参加店舗（仮データ） ---
  {
    id: "store-kurofune-summer-sweets",
    category: "store",
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
    category: "store",
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
    category: "store",
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

  // --- 終了したイベント ---
  {
    id: "mobara-sakura-2026",
    category: "mobara-city",
    title: "茂原桜まつり",
    summary:
      "茂原公園で約2,000本の桜が楽しめるお花見イベント。和太鼓や屋台なども開催。",
    startDate: "2026-03-28",
    endDate: "2026-03-29",
    venue: "茂原公園",
    detailUrl: "https://maruchiba.jp/event/detail_12638.html",
    isActive: true,
  },
  {
    id: "mobara-winter-tanabata-2026",
    category: "mobara-city",
    title: "2026 もばら冬の七夕まつり・イルミネーション",
    summary:
      "茂原公園をライトアップする冬のロマンチックなイベント。イルミネーションも開催。",
    startDate: "2026-02-07",
    endDate: "2026-03-04",
    venue: "茂原公園",
    detailUrl: "https://maruchiba.jp/event/detail_10888.html",
    isActive: true,
  },
  {
    id: "asmo-fathers-day-2026",
    category: "asmo",
    title: "父の日似顔絵展",
    summary: "アスモ館内で開催された父の日関連イベント。",
    startDate: "2026-06-01",
    endDate: "2026-06-05",
    venue: "茂原ショッピングプラザアスモ",
    detailUrl: "https://asmo-sc.com/event/",
    isActive: true,
  },
];
