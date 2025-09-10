# まちサーガ LP Assets

まちサーガプロジェクトのランディングページ（LP）で使用するメディアファイルを整理するディレクトリです。

## 📁 ディレクトリ構造

```
lp-assets/
├── README.md               # このファイル
├── images/                 # 画像ファイル
│   ├── heroes/            # ヒーローセクション用画像
│   ├── features/          # 特徴・機能説明用画像
│   ├── games/             # ゲーム紹介用画像
│   └── backgrounds/       # 背景画像
├── icons/                 # アイコンファイル
├── screenshots/           # ゲームスクリーンショット
├── logos/                 # ロゴファイル
├── banners/              # バナー画像
├── css/                  # LP専用CSSファイル
├── js/                   # LP専用JavaScriptファイル
└── fonts/                # カスタムフォントファイル
```

## 🖼️ 推奨ファイル形式・サイズ

### 画像ファイル

- **形式**: WebP (推奨), PNG, JPG
- **ヒーロー画像**: 1920x1080px 以上
- **カード画像**: 400x300px 程度
- **アイコン**: 64x64px, 128x128px, 256x256px
- **ロゴ**: SVG (推奨), PNG (高解像度)

### ファイル命名規則

```
hero-main.webp              # ヒーローセクションメイン画像
feature-retro-game.png      # レトロゲーム機能説明画像
game-mobara-preview.jpg     # 黒船菓子店プレビュー画像
game-masuya-preview.jpg     # 串かつ枡やプレビュー画像
icon-retro-controller.svg   # レトロコントローラーアイコン
logo-machisaga-main.svg     # まちサーガメインロゴ
```

## 📋 推奨画像リスト

### ヒーローセクション (images/heroes/)

- `hero-main.webp` - メインヒーロー画像
- `hero-background.webp` - 背景画像
- `hero-overlay.png` - オーバーレイエフェクト

### 特徴説明 (images/features/)

- `feature-retro-game.png` - レトロゲーム体験
- `feature-local-shops.png` - 街の名店テーマ
- `feature-immersive.png` - 臨場感演出

### ゲーム紹介 (images/games/)

- `game-mobara-hero.png` - 黒船菓子店ヒーロー画像
- `game-mobara-battle.png` - バトルシーン
- `game-masuya-hero.png` - 串かつ枡やヒーロー画像
- `game-masuya-battle.png` - バトルシーン

### アイコン (icons/)

- `icon-controller.svg` - ゲームコントローラー
- `icon-shop.svg` - 店舗アイコン
- `icon-music.svg` - 音楽アイコン
- `icon-battle.svg` - バトルアイコン

### ロゴ (logos/)

- `logo-machisaga.svg` - まちサーガメインロゴ
- `logo-machisaga-white.svg` - 白色バージョン
- `logo-mobara.png` - 黒船菓子店ロゴ
- `logo-masuya.png` - 串かつ枡やロゴ

### スクリーンショット (screenshots/)

- `screenshot-mobara-gameplay.png` - 黒船菓子店ゲームプレイ
- `screenshot-masuya-gameplay.png` - 串かつ枡やゲームプレイ
- `screenshot-roulette.png` - ルーレット画面
- `screenshot-battle.png` - バトル画面

## 🎨 デザインガイドライン

### カラーパレット

- **プライマリ**: #4ecdc4 (ティール)
- **セカンダリ**: #ff6b6b (コーラル)
- **アクセント**: #45b7d1 (ブルー)
- **背景**: #1a1a2e (ダークブルー)
- **テキスト**: #ffffff (ホワイト)

### フォント

- **見出し**: DotGothic16 (レトロ感)
- **本文**: Noto Sans JP (読みやすさ)

## 📱 レスポンシブ対応

すべての画像は以下のブレークポイントに対応：

- **デスクトップ**: 1200px 以上
- **タブレット**: 768px - 1199px
- **スマートフォン**: 767px 以下

## 🚀 最適化のヒント

1. **WebP 形式を優先使用** - ファイルサイズ削減
2. **適切な解像度** - 用途に応じたサイズ選択
3. **alt 属性の設定** - アクセシビリティ向上
4. **lazy loading** - パフォーマンス向上
5. **画像圧縮** - 読み込み速度向上

## 📝 使用例

### HTML での画像使用例

```html
<!-- ヒーロー画像 -->
<img
  src="./lp-assets/images/heroes/hero-main.webp"
  alt="まちサーガ - 街の物語を紡ぐバトルシミュレーター"
  loading="lazy"
/>

<!-- 特徴説明アイコン -->
<img
  src="./lp-assets/icons/icon-controller.svg"
  alt="レトロゲーム体験"
  width="64"
  height="64"
/>
```

### CSS での背景画像使用例

```css
.hero-section {
  background-image: url("./lp-assets/images/backgrounds/hero-background.webp");
  background-size: cover;
  background-position: center;
}
```

---

**作成日**: 2025 年 1 月
**プロジェクト**: まちサーガ
**バージョン**: 1.0
