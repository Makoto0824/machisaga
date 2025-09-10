# 勇者 NFT × きせかえ セクション用画像

このディレクトリは「勇者 NFT × きせかえ」セクションで使用する画像を管理します。

## シンプルなディレクトリ構造

```
lp-assets/images/nft/
├── hero_base.png         # ベースとなる勇者 NFT
├── helmet.png            # 戦士の兜
├── armor.png             # 魔法の鎧
├── weapon.png            # エルフの弓
├── shield.png            # 聖なる盾
├── bg.png                # 魔法の森（背景）
├── friend.png            # ドラゴンの相棒
├── [その他の画像ファイル]  # 追加する画像は直接配置
└── README.md             # このファイル
```

## 推奨画像仕様

### NFT アイテム画像

- **ファイル形式**: PNG（背景透明推奨）
- **サイズ**: 200×200px または 400×400px
- **ファイルサイズ**: 200KB 以下

### その他の画像

- **背景画像**: PNG または JPG
- **合成画像**: PNG（背景透明必須）
- **ファイルサイズ**: 300KB 以下

## 使用方法

### HTML での参照例

```html
<!-- ベース勇者 -->
<img
  src="./lp-assets/images/nft/hero_base.png"
  alt="ベース勇者NFT"
  loading="lazy"
/>

<!-- アイテム -->
<img src="./lp-assets/images/nft/helmet.png" alt="戦士の兜" loading="lazy" />
```

### CSS での背景画像使用例

```css
.item-showcase {
  background-image: url("./lp-assets/images/nft/armor.png");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
```

## ファイル命名規則

### ベース勇者

- `hero_base.png` - ベースとなる勇者 NFT

### アイテムカテゴリ

- `helmet.png` - 頭装備
- `armor.png` - 胴装備
- `weapon.png` - 武器
- `shield.png` - 盾
- `bg.png` - 背景
- `friend.png` - 相棒・ペット

### 追加アイテムの命名

- `[カテゴリ]_[種類].png` - 例: `weapon_sword.png`, `armor_light.png`
- `[アイテム名]_[レアリティ].png` - 例: `helmet_legendary.png`, `friend_rare.png`

## 注意事項

1. **著作権**: 使用する画像の著作権を確認してください
2. **ファイル名**: 英数字とアンダースコアのみを使用（日本語 NG）
3. **圧縮**: 適切に圧縮してファイルサイズを最適化
4. **alt 属性**: 必ず適切な alt 属性を設定
5. **lazy loading**: 初期表示に不要な画像は`loading="lazy"`を使用

## 現在の画像ファイル

### ベース

- `hero_base.png` - ベース勇者（Lv.1）

### アイテム

- `helmet.png` - 戦士の兜（⚔️ 防御力 +25）
- `armor.png` - 魔法の鎧（🔮 魔力 +30）
- `weapon.png` - エルフの弓（🏹 敏捷性 +22）
- `shield.png` - 聖なる盾（🛡️ 防御力 +35）
- `bg.png` - 魔法の森（🌲 背景アイテム）
- `friend.png` - ドラゴンの相棒（🐉 仲間 +50）

## インタラクティブ機能での使用

この画像ファイルは以下の機能で使用されています：

1. **ホバーインタラクション**: アイテムにホバーすると画像が切り替わり
2. **カルーセル表示**: 各アイテムの詳細説明付きスライダー
3. **レスポンシブ対応**: 全デバイスで最適表示

新しい画像を追加する場合は、上記の命名規則に従ってこのディレクトリに直接配置してください。
