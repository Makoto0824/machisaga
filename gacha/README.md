# まちサーガガチャ

まちサーガの地域別ガチャ Web 版です。  
1日3回までガチャを回し、参加店舗で使える独自クーポンが当たります。

## URL 構成

| 環境 | URL |
|------|-----|
| 本番（例） | `https://machisaga-gacha.vercel.app/mobara` |
| 仮置き地域 | `https://machisaga-gacha.vercel.app/hoge-city` |
| ローカル | `http://localhost:3002/mobara` |

`/` にアクセスすると `/mobara` へリダイレクトします。

## 使用技術

- Next.js（App Router）
- TypeScript
- Tailwind CSS
- Supabase（任意・未設定時は localStorage で動作）
- Vercel デプロイ想定

## リポジトリ内の場所

```text
~/projects/machisaga-repo/
├── index.html  …ゲーム本体
└── gacha/      # ガチャアプリ（Vercel Root Directory: gacha）
    ├── app/[region]/   # 地域別ルート（/mobara, /hoge-city）
    └── data/regions/   # 地域ごとの店舗・景品データ
```

## 起動方法

```bash
cd ~/projects/machisaga-repo/gacha
npm install
npm run dev
```

- 茂原: [http://localhost:3002/mobara](http://localhost:3002/mobara)
- 仮置き: [http://localhost:3002/hoge-city](http://localhost:3002/hoge-city)

> 同じマシンでゲーム本体が `3000` を使っているため、ガチャは **`3002`** で起動します。

## 地域の追加方法

1. `data/regions/新地域.ts` に `RegionConfig` を定義
2. `data/regions/index.ts` の `REGIONS` に登録
3. 自動的に `/{slug}` でアクセス可能

## Vercel へのデプロイ

ゲーム本体とは **別の Vercel プロジェクト** を作成し、GitHub リポジトリ `Makoto0824/machisaga` を接続します。

1. [Vercel](https://vercel.com/) → **Add New Project** → `machisaga` を選択
2. **Root Directory** を `gacha` に設定
3. Framework Preset: **Next.js**
4. 環境変数（Supabase を使う場合）:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. デプロイ後:
   - `https://（プロジェクト名）.vercel.app/mobara`
   - `https://（プロジェクト名）.vercel.app/hoge-city`

## 環境変数

`.env.example` を `.env.local` にコピーし、Supabase を使う場合は値を設定します。

**Supabase 未設定**でも localStorage で動作します（地域ごとにデータは分離されます）。

## ファイル構成

```
app/
  page.tsx              # / → /mobara へリダイレクト
  [region]/
    page.tsx            # ガチャ画面
    layout.tsx          # 地域メタデータ・RegionProvider
data/
  types.ts
  regions/
    mobara.ts
    hoge-city.ts
    index.ts
components/
lib/
```
