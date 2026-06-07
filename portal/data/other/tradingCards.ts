import type { RegionTradingCardContent } from "@/data/other/types";
import { publicPath } from "@/lib/paths";

export const mobaraTradingCardContent: RegionTradingCardContent = {
  title: "まちサーガトレカ",
  subtitle: "まちの勇者たちを、トレーディングカードに",
  introParagraphs: [
    "まちサーガトレカは、茂原市内の企業・お店・人をキャラクターカード化し、集めて遊びながらまちの魅力を伝える地域共創プロジェクトです。",
    "高校生による地元企業の取材、プロによるイラスト制作を経て、全18種のカードが誕生しました。",
    "蔦屋書店茂原店やショッピングプラザアスモなどでの配布・交流イベントを通じ、地域内外の人々のつながりを広げています。",
    "カードを使って遊べるWebゲームも、現在鋭意制作中です。",
  ],
  highlights: [
    "全18種のオリジナルトレーディングカード",
    "トレカWebゲーム（鋭意制作中）",
    "協力店舗・地元の魅力をカードで紹介",
    "イベント配布・交流をきっかけにまちをもっと好きに",
  ],
  gameNotice:
    "まちサーガトレカのWebゲームを鋭意制作中です。公開まで今しばらくお待ちください。",
  externalLinks: [
    {
      id: "campfire",
      title: "CAMPFIRE プロジェクトページ",
      summary:
        "まちサーガトレカのクラウドファンディング・活動報告はこちらでご覧いただけます。",
      href: "https://camp-fire.jp/projects/840045/view",
      linkLabel: "CAMPFIREで見る",
    },
  ],
  cards: [
    {
      id: "card-1",
      name: "茂原黒船",
      tagline: "茂原で50年創作スイーツ店",
      image: publicPath("/assets/images/trading-card/card1.png"),
    },
    {
      id: "card-2",
      name: "レーヴ",
      tagline: "創作スイーツ＆フレンチ",
      image: publicPath("/assets/images/trading-card/card2.png"),
    },
    {
      id: "card-3",
      name: "バーガーキッチン ラフィン",
      tagline: "茂原市で唯一のハンバーガー専門店",
      image: publicPath("/assets/images/trading-card/card3.png"),
    },
    {
      id: "card-4",
      name: "車検のコバック 茂原店",
      tagline: "全メーカーの車をどこよりもお得にご案内",
      image: publicPath("/assets/images/trading-card/card4.png"),
    },
    {
      id: "card-5",
      name: "ZUTTO 道場",
      tagline: "今日もZUTTO道場でちからをつけます",
      image: publicPath("/assets/images/trading-card/card5.png"),
    },
    {
      id: "card-6",
      name: "Studio Clove",
      tagline: "音楽スタジオ・ライブハウス",
      image: publicPath("/assets/images/trading-card/card6.png"),
    },
    {
      id: "card-7",
      name: "株式会社 山崎組",
      tagline: "茂原の街をつくり、笑顔もつくる",
      image: publicPath("/assets/images/trading-card/card7.png"),
    },
    {
      id: "card-8",
      name: "アンテナショップ『彩り市場』",
      tagline: "茂原市の魅力がたっぷり詰まったアンテナショップ",
      image: publicPath("/assets/images/trading-card/card8.png"),
    },
    {
      id: "card-9",
      name: "ナルケ薬粧",
      tagline: "美は習慣から、病は気から、笑顔は心から",
      image: publicPath("/assets/images/trading-card/card9.png"),
    },
    {
      id: "card-10",
      name: "市原薬局",
      tagline: "茂原で創業80年の薬局です",
      image: publicPath("/assets/images/trading-card/card10.png"),
    },
    {
      id: "card-11",
      name: "モルフェ",
      tagline: "全国でも稀な、医療美容師在籍の美容室",
      image: publicPath("/assets/images/trading-card/card11.png"),
    },
    {
      id: "card-12",
      name: "味来",
      tagline: "茂原市の老舗中華料理店",
      image: publicPath("/assets/images/trading-card/card12.png"),
    },
    {
      id: "card-13",
      name: "志村精機製作所",
      tagline: "削り出されたモノたちが日々生まれる",
      image: publicPath("/assets/images/trading-card/card13.png"),
    },
    {
      id: "card-14",
      name: "ウッドギャラリー ヨシモク",
      tagline: "木の力で生活を豊かに",
      image: publicPath("/assets/images/trading-card/card14.png"),
    },
    {
      id: "card-15",
      name: "ViViTO 美容室",
      tagline: "茂原市で愛される実力派老舗サロン",
      image: publicPath("/assets/images/trading-card/card15.png"),
    },
    {
      id: "card-16",
      name: "中国料理 香 xiang",
      tagline: "薬膳料理を取り入れた、身体にやさしい中国料理",
      image: publicPath("/assets/images/trading-card/card16.png"),
    },
    {
      id: "card-17",
      name: "御菓子司 三矢",
      tagline: "「また食べたくなる和菓子」をコンセプトに",
      image: publicPath("/assets/images/trading-card/card17.png"),
    },
    {
      id: "card-18",
      name: "アスモ",
      tagline: "地元の皆様の元気を応援します",
      image: publicPath("/assets/images/trading-card/card18.png"),
    },
  ],
};
