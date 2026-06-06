# まちサーガ茂原ガチャ

まちサーガの「茂原ガチャ」Web版プロトタイプです。  
1日3回までガチャを回し、参加店舗で使える独自クーポンが当たります。

## 使用技術

- Next.js（App Router）
- TypeScript
- Tailwind CSS
- Supabase（任意・未設定時は localStorage で動作）
- Vercel デプロイ想定

## 画面構成

| 画面 | 説明 |
|------|------|
| ガチャ | 1日3回制限、抽選演出、結果表示 |
| 獲得クーポン一覧 | 当選クーポンの一覧・ステータス |
| クーポン詳細 | 特典内容・「使用する」ボタン |
| 参加店舗 | ダミー店舗一覧・詳細モーダル |

下部ナビで「ガチャ」「クーポン」「店舗」を切り替えます。

## リポジトリ内の場所

`machisaga` リポジトリ（ローカル: `~/projects/machisaga-repo/`）の **`gacha/mobara/`** にあります。

```text
~/projects/machisaga-repo/   # ゲーム本体 + ガチャ（GitHub: Makoto0824/machisaga）
├── index.html  …ゲームファイル
└── gacha/
    └── mobara/            # 茂原ガチャ（Vercel Root Directory: gacha/mobara）
```

## 起動方法

```bash
cd ~/projects/machisaga-repo/gacha/mobara
npm install
npm run dev
```

ブラウザで [http://localhost:3002](http://localhost:3002) を開きます。

> **ポートについて**  
> 同じマシンで `machisaga` 本体が `3000` を使っているため、ガチャは **`3002`** で起動します。  
> `http://localhost:3000` を開くと別アプリや応答しない画面になることがあります。

### 画面が真っ白なとき

1. **正しいディレクトリ**で起動しているか確認: `cd gacha/mobara` のあと `npm run dev`
2. ターミナルに表示された URL（`http://localhost:3002`）を開く
3. 古いサーバーを止める:
   ```bash
   lsof -i :3000 -i :3002
   kill <PID>
   npm run dev
   ```
4. ブラウザをスーパーリロード（Mac: `Cmd + Shift + R`）
5. 開発者ツールの Console に赤いエラーがないか確認

### 本番ビルド

```bash
npm run build
npm start
```

## Vercel へのデプロイ

ゲーム本体（`machisaga`）とは **別の Vercel プロジェクト** を作成し、同じ GitHub リポジトリ `Makoto0824/machisaga` を接続します。

1. [Vercel](https://vercel.com/) → **Add New Project** → `machisaga` リポジトリを選択
2. **Root Directory** を `gacha/mobara` に設定（Edit → `gacha/mobara` を指定）
3. Framework Preset は **Next.js**（自動検出）
4. Build Command: `npm run build`、Output Directory: デフォルトのまま
5. 環境変数（Supabase を使う場合）:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. デプロイ後、表示された URL（例: `https://machisaga-gacha.vercel.app`）で確認

> ゲーム本体の Vercel プロジェクト（Root Directory: リポジトリルート）はそのまま利用できます。ガチャだけ Root Directory が異なる別プロジェクトになります。

Supabase 未設定でも localStorage で動作します。カスタムドメインは Vercel ダッシュボードから設定できます。

## 環境変数

`.env.example` を `.env.local` にコピーし、Supabase を使う場合は値を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Supabase を設定しない場合**も、モックデータと localStorage によりガチャ・クーポン機能をローカルで試せます。

## Supabase の設定方法

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. SQL Editor で `supabase/schema.sql` を実行
3. Project Settings → API から URL と anon key を `.env.local` に設定
4. 開発サーバーを再起動

景品マスタはアプリ内の `data/mockData.ts` を参照して抽選しています。DB の `coupons` テーブルは将来の管理用です。

## 初期ユーザー

初期 Web 版では仮ユーザー ID **`demo-user-001`** を使用しています。

```ts
// lib/user.ts
export function getCurrentUserId(): string {
  return "demo-user-001";
}
```

## LINE LIFF 対応時

LINE ミニアプリ化するときは **`getCurrentUserId()` の実装だけ**を LIFF の `userId` 取得に差し替えてください。画面・ガチャロジックはそのまま使えます。

## 本番運用の注意（RLS・認証）

`supabase/schema.sql` には開発用の緩い RLS ポリシーが含まれています。**本番公開前には必ず以下を整えてください。**

- 適切な Row Level Security（ユーザーごとに自分のデータのみ読み書き）
- 認証（LINE LIFF トークン検証など）
- 開発用の `for all using (true)` ポリシーの削除

README および schema 内コメントにも同旨を記載しています。

## 今回含まないもの

- LINE 公式クーポン連携
- 位置情報・店舗 QR
- 店員用管理画面
- 複雑な管理画面

## ファイル構成

```
app/
  page.tsx          # 画面切り替え（useState）
  layout.tsx
components/
  MobileFrame.tsx
  GachaScreen.tsx
  CouponListScreen.tsx
  CouponDetailScreen.tsx
  StoreListScreen.tsx
  BottomNav.tsx
  Modal.tsx
lib/
  supabase.ts
  user.ts
  gacha.ts
  date.ts
  storage.ts        # Supabase 未設定時の localStorage
data/
  mockData.ts
supabase/
  schema.sql
```
