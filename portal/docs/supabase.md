# Supabase 仕様（まちサーガ portal）

チャンス・クーポン機能のデータ永続化に Supabase を利用する。Games（静的ビルド）は Supabase 不要。

## 導入理由

| 課題 | Supabase なし | Supabase あり |
|------|---------------|---------------|
| 挑戦履歴・クーポンの保存 | ブラウザ内のみ | クラウド DB |
| 改ざん | localStorage を直接編集可能 | DB + RLS で防御 |
| 他人のデータ | — | RLS で本人のみ |
| 同一人物の判定（端末跨ぎ） | 弱い | Anonymous だけでは不十分 → **LIFF 化で LINE ID** |

**一言:** チャンス結果とクーポンを、ユーザーごとにサーバー側で安全に保存するため。

---

## 動作モード

環境変数 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` の有無で切り替わる。

| モード | 条件 | データ保存 |
|--------|------|------------|
| **Supabase** | 上記2つが設定済み | `chance_logs` / `user_coupons` |
| **localStorage** | 未設定 | ブラウザ localStorage（地域 slug 単位） |

---

## ユーザー ID

### Supabase 有効時（現状の本番・ローカル）

1. `AuthProvider` が起動時に `resolveUserId()` を実行
2. `supabase.auth.signInAnonymously()`（初回）または `getSession()`（2回目以降）
3. **`session.user.id`（UUID）** を `user_id` として DB に保存

これが **Anonymous Auth の UUID**。Supabase Dashboard → Authentication → Users にも表示される。

### Supabase 未設定時

`localStorage` に `machisaga_user_id` として UUID を生成・保存（端末・ブラウザごと）。

### 将来（LIFF）

`lib/auth.ts` の `resolveUserId()` を LINE の userId / sub に差し替える。DB の `user_id` 列はそのまま利用可能。

---

## データベース

### テーブル

| テーブル | 用途 |
|----------|------|
| `chance_logs` | チャンス挑戦履歴（当たり・はずれ） |
| `user_coupons` | 獲得クーポン（使用済み `used_at` 含む） |
| `coupons` | 景品マスタ（将来用・現状はアプリ内 `data/regions/` を参照） |

### SQL ファイル

| ファイル | タイミング |
|----------|------------|
| `supabase/schema.sql` | 初回セットアップ（テーブル + 開発用 RLS） |
| `supabase/grants.sql` | `permission denied` 時の権限付与 |
| `supabase/rls-production.sql` | **本番公開前**（開発用 RLS → 本人のみ） |

---

## RLS（Row Level Security）

### 開発用（`schema.sql`）

`using (true)` — 動作確認用。API を直接叩くと他人の行にも触れうる。

### 本番用（`rls-production.sql` 実行後）

`user_id = auth.uid()::text` の行のみ SELECT / INSERT / UPDATE / DELETE。

Anonymous ユーザーは Supabase 上 **`authenticated` ロール** として扱われる。

---

## セットアップ手順

1. SQL Editor で `supabase/schema.sql` を実行
2. Authentication → Providers → **Anonymous Sign-Ins** を ON
3. Project Settings → API から **API URL** と **Publishable key** を取得
4. `portal/.env.local` に設定（URL は `/rest/v1/` なし）
5. `supabase/grants.sql` を実行（必要時）
6. ローカルでチャンス1回 → `chance_logs` に行が増えることを確認
7. **`supabase/rls-production.sql` を実行**（本番公開前）
8. Vercel に同じ環境変数を設定 → Redeploy

## テスト用リセット

| 環境 | 方法 |
|------|------|
| **ローカル**（`npm run dev`） | 画面下部「クーポン・回数をリセット」 |
| **本番** | 非表示。Dashboard → Table Editor で自分の `user_id` の行を削除 |

本番ビルドではテスト欄は既定で非表示（`NODE_ENV=production`）。`NEXT_PUBLIC_ENABLE_TEST_TOOLS=true` のときのみ本番でも表示。

---

## 関連コード

| ファイル | 役割 |
|----------|------|
| `lib/auth.ts` | Anonymous Auth / localStorage UUID |
| `lib/user.ts` | `resolveUserId()` の公開 |
| `lib/supabase.ts` | クライアント生成 |
| `lib/chance.ts` | チャンス・クーポンの DB 読み書き |
| `components/AuthProvider.tsx` | 起動時認証 |

---

## Supabase vs localStorage 比較

| 項目 | localStorage のみ | Supabase（Anonymous Auth） |
|------|-------------------|----------------------------|
| **保存場所** | ブラウザ内 | クラウド DB |
| **ユーザー ID** | 自前 UUID（localStorage） | Supabase Anonymous UUID |
| **ブラウザ再起動** | 通常は維持 | **維持**（セッション復元） |
| **タブを閉じて再開** | 維持 | 維持 |
| **Chrome ↔ Safari** | 別 storage → **別人** | 別セッション → **別 UUID・別人** |
| **PC ↔ スマホ** | **別人**（各3回の可能性） | **別 UUID・別人** |
| **サイトデータ削除** | 履歴・クーポン消失 | **新 UUID** → 画面上はリセット（旧データは DB に残るが参照不可） |
| **シークレットモード** | ウィンドウ閉じで別セッション | 同左 |
| **改ざん** | devtools で容易 | 履歴は DB 側（RLS あり） |
| **他人のクーポン閲覧** | 該当なし（端末ローカルのみ） | 本番 RLS で **不可** |
| **端末跨ぎで同一人物** | 不可 | Anonymous だけでは **不可** → LIFF |
| **オフライン** | 動作 | DB 接続必要 |
| **環境変数** | 不要 | URL + Publishable key 必須 |

---

## 操作ごとの挙動（Supabase 有効時）

| ユーザーの操作 | 残り回数 | クーポン保有 |
|----------------|----------|--------------|
| 同じブラウザで再訪問 | 維持 | 維持 |
| ブラウザ再起動 | 維持 | 維持 |
| 別ブラウザに変更 | **別 UUID（リセット扱い）** | **見えない** |
| サイトデータ削除 | **新 UUID（3回から）** | **見えない** |
| LIFF 化後（将来・同一 LINE） | **LINE ID で統一** | **引き継ぎ可能** |

---

## よくある誤解

| 誤解 | 正しい理解 |
|------|------------|
| スマホ1台 = UUID 1つ | **ブラウザごと**に UUID（Safari / Chrome は別） |
| データ削除しても DB の回数は残る | 旧 UUID のデータは DB に残るが、**新 UUID からは見えず実質リセット** |
| Supabase なら PC+スマホ6回を防げる | **Anonymous だけでは防げない**（LIFF または PC ブロック等が必要） |
| Publishable key は秘密 | `NEXT_PUBLIC_` のため **ブラウザに露出**。RLS で保護する |

---

## 今後の拡張

- **LIFF 化:** `resolveUserId()` → LINE ID。リッチメニュー入口と相性が良い
- **PC ブロック:** 運用上の対策（現状は見送り、LIFF 優先）

---

## 参考

- セットアップ概要: `README.md` の「Supabase セットアップ」
- 環境変数テンプレート: `.env.example`
- チャンス仕様: `docs/chance.txt`
