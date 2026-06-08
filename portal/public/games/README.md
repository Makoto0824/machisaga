# ゲームビルド成果物の配置場所

他プロジェクトで build したゲームの成果物（`index.html` や JS / アセット一式）を、この `public/games/` 配下に配置します。

## ディレクトリ

| slug | 配置先 | 公開 URL（例） |
|------|--------|----------------|
| 勇者を探せ | `find-the-hero/` | `/games/find-the-hero/index.html` |
| トレカ Web ゲーム | `trading-card/` | `/games/trading-card/index.html` |
| スーパージャムロールチャレンジ | `super-jam-roll-challenge/` | `/games/super-jam-roll-challenge/index.html` |
| GameB | `game-b/` | `/games/game-b/index.html` |

## アップロード手順

1. ゲーム側の build で **base / publicPath** を上記 slug に合わせる（例: `/games/find-the-hero/`）
2. 生成された `dist` / `build` の中身を、対応するサブディレクトリに **中身ごと** コピーする
3. 各ディレクトリに `index.html` があることを確認する
4. portal をデプロイする

**URL:** Next.js では `/games/{slug}/`（末尾スラッシュ）が 404 になることがあります。リンクは `/games/{slug}/index.html` を使ってください。

## 例（Vite）

```js
// vite.config.js
export default {
  base: "/games/find-the-hero/",
};
```

## 注意

- portal の Next.js には `basePath` は付けていません。ゲーム URL は `/games/{slug}/` です
- 新しいゲームを追加するときは `public/games/{slug}/` を作成し、Games 一覧データ側も更新してください
