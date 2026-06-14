-- 本番用 RLS（Anonymous Auth 利用時）
-- 前提: portal/supabase/schema.sql を実行済みであること
-- Supabase Dashboard → Authentication → Sign In / Providers → Anonymous Sign-Ins を ON

-- 開発用ポリシーを削除
drop policy if exists "dev_coupons_all" on coupons;
drop policy if exists "dev_chance_logs_all" on chance_logs;
drop policy if exists "dev_user_coupons_all" on user_coupons;

grant select on public.coupons to authenticated;
grant select, insert, delete on public.chance_logs to authenticated;
grant select, insert, update, delete on public.user_coupons to authenticated;

-- chance_logs: 自分の user_id のみ
create policy "chance_logs_select_own"
  on chance_logs for select
  to authenticated
  using (user_id = (select auth.uid()::text));

create policy "chance_logs_insert_own"
  on chance_logs for insert
  to authenticated
  with check (user_id = (select auth.uid()::text));

create policy "chance_logs_delete_own"
  on chance_logs for delete
  to authenticated
  using (user_id = (select auth.uid()::text));

-- user_coupons: 自分の user_id のみ
create policy "user_coupons_select_own"
  on user_coupons for select
  to authenticated
  using (user_id = (select auth.uid()::text));

create policy "user_coupons_insert_own"
  on user_coupons for insert
  to authenticated
  with check (user_id = (select auth.uid()::text));

create policy "user_coupons_update_own"
  on user_coupons for update
  to authenticated
  using (user_id = (select auth.uid()::text))
  with check (user_id = (select auth.uid()::text));

create policy "user_coupons_delete_own"
  on user_coupons for delete
  to authenticated
  using (user_id = (select auth.uid()::text));

-- coupons マスタ（将来利用時）: 認証済みユーザーの参照のみ
create policy "coupons_select_active"
  on coupons for select
  to authenticated
  using (is_active = true);
