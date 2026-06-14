-- テーブル作成後に permission denied が出る場合、SQL Editor でこのファイルを実行してください

grant select on public.coupons to anon, authenticated;
grant select, insert, delete on public.chance_logs to anon, authenticated;
grant select, insert, update, delete on public.user_coupons to anon, authenticated;
