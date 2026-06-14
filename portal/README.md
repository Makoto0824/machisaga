# まちサーガポータル

まちサーガの地域別 Web ポータルです。チャンス・ゲーム・イベントなどを提供します。

## URL 構成

| 環境 | URL |
|------|-----|
| 本番 | `https://machisaga-portal.vercel.app/mobara/chance` |
| 仮置き地域 | `https://machisaga-portal.vercel.app/hoge-city/chance` |
| ローカル | `http://localhost:3002/mobara/chance` |

`/` にアクセスすると `/mobara/chance` へリダイレクトします。

### タブ指定（LINE リッチメニュー用）

`?tab=` で起動時の画面を指定できます。タブ切り替え時も URL に反映されます。

| 画面 | URL（茂原市の例） |
|------|-------------------|
| チャンス | `https://machisaga-portal.vercel.app/mobara/chance` |
| クーポン | `https://machisaga-portal.vercel.app/mobara/chance?tab=coupons` |
| 店舗 | `https://machisaga-portal.vercel.app/mobara/chance?tab=stores` |
| ゲーム | `https://machisaga-portal.vercel.app/mobara/games` |
| イベント | `https://machisaga-portal.vercel.app/mobara/events` |
| その他 | `https://machisaga-portal.vercel.app/mobara/other` |

## 使用技術

- Next.js（App Router）
- TypeScript
- Tailwind CSS
- Supabase（任意・未設定時は localStorage で動作）
- Vercel デプロイ想定

## リポジトリ内の場所

```text
~/projects/machisaga-repo/
└── portal/     # ポータルアプリ（Vercel Root Directory: portal）
    ├── app/[region]/   # 地域別ルート
    │   ├── chance/
    │   ├── games/
    │   ├── events/
    │   └── other/
    └── data/regions/   # 地域ごとの店舗・景品データ
```

## 起動方法

```bash
cd ~/projects/machisaga-repo/portal
npm install
npm run dev
```

- 茂原市チャンス: [http://localhost:3002/mobara/chance](http://localhost:3002/mobara/chance)
- 仮置き: [http://localhost:3002/hoge-city/chance](http://localhost:3002/hoge-city/chance)

## 地域の追加方法

1. `data/regions/新地域.ts` に `RegionConfig` を定義
2. `data/regions/index.ts` の `REGIONS` に登録
3. 自動的に `/{slug}/chance` などでアクセス可能

## Vercel へのデプロイ

**Vercel プロジェクト** `machisaga-portal` を使用します。

1. GitHub リポジトリ `Makoto0824/machisaga` を接続
2. **Root Directory** を `portal` に設定
3. Framework Preset: **Next.js**
4. 環境変数（Supabase を使う場合）:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. デプロイ後:
   - `https://machisaga-portal.vercel.app/mobara/chance`
   - `https://machisaga-portal.vercel.app/hoge-city/chance`

## 環境変数

`.env.example` を `.env.local` にコピーし、Supabase を使う場合は値を設定します。

**Supabase 未設定**でも端末ごとの localStorage UUID で動作します（地域ごとにデータは分離されます）。

### Supabase セットアップ

1. Supabase Dashboard → **SQL Editor** で `supabase/schema.sql` を実行
2. **Authentication → Providers → Anonymous Sign-Ins** を **ON**
3. **Project Settings → API** から URL と `anon` key を `.env.local` に設定
4. ローカルでチャンスを1回実行し、`chance_logs` に行が増えることを確認
5. 本番公開前に `supabase/rls-production.sql` を実行（開発用 RLS を置き換え）
6. Vercel に同じ環境変数を設定 → Redeploy

**テスト用リセット:** ローカル（`npm run dev`）のみ画面に表示。本番は Supabase Dashboard で `chance_logs` / `user_coupons` を削除（[`docs/supabase.md`](docs/supabase.md) 参照）。

ユーザー ID は Anonymous Auth の `session.user.id` を `user_id` として保存します。LIFF 化時は `lib/auth.ts` の `resolveUserId()` を LINE ID 取得に差し替えます。

詳細は [`docs/supabase.md`](docs/supabase.md)（localStorage との比較表含む）を参照。

## ファイル構成

```
app/
  page.tsx                    # / → /mobara/chance
  [region]/
    layout.tsx                # RegionProvider + AuthProvider
    page.tsx                  # /mobara → /mobara/chance
    chance/page.tsx           # チャンス画面
    games/page.tsx
    events/page.tsx
    other/page.tsx
data/
  types.ts
  regions/
    mobara.ts
    hoge-city.ts
    index.ts
components/
  ChanceScreen.tsx
lib/
  auth.ts
  chance.ts
  supabase.ts
supabase/
  schema.sql
  rls-production.sql
```
