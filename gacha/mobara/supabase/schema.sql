-- まちサーガ茂原ガチャ Supabase スキーマ（開発用）
-- 本番では RLS と認証を必ず設定してください

create extension if not exists "uuid-ossp";

-- ガチャ景品マスタ
create table if not exists coupons (
  id uuid primary key default uuid_generate_v4(),
  store_id text,
  store_name text not null,
  title text not null,
  description text not null,
  usage_condition text not null default '',
  probability integer not null,
  expires_days integer not null default 30,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ガチャ履歴（coupon_id はアプリ内 mockData の ID を text で保存）
create table if not exists gacha_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  coupon_id text,
  result_type text not null check (result_type in ('win', 'lose')),
  played_at timestamptz not null default now()
);

create index if not exists gacha_logs_user_played_idx
  on gacha_logs (user_id, played_at desc);

-- ユーザー獲得クーポン
create table if not exists user_coupons (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  coupon_id text not null,
  store_name text not null,
  title text not null,
  description text not null,
  usage_condition text not null default '',
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create index if not exists user_coupons_user_idx
  on user_coupons (user_id, issued_at desc);

-- 開発用: 匿名キーで読み書き可能（本番では削除し RLS を設定）
alter table coupons enable row level security;
alter table gacha_logs enable row level security;
alter table user_coupons enable row level security;

create policy "dev_coupons_all" on coupons for all using (true) with check (true);
create policy "dev_gacha_logs_all" on gacha_logs for all using (true) with check (true);
create policy "dev_user_coupons_all" on user_coupons for all using (true) with check (true);

-- 初期景品データ（text id 版の mock と併用する場合はアプリ側 mock を優先可）
-- insert はアプリの mockData を参照して手動投入してください
