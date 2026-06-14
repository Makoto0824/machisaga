/**
 * テスト用リセットボタンの表示判定。
 * - ローカル開発（npm run dev）: 表示
 * - 本番ビルド: 非表示（NEXT_PUBLIC_ENABLE_TEST_TOOLS=true でのみ表示）
 * - 本番リセット: Supabase Dashboard で chance_logs / user_coupons を削除
 */
export function isTestToolsEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_ENABLE_TEST_TOOLS;
  if (flag === "false") return false;
  if (flag === "true") return true;
  return process.env.NODE_ENV === "development";
}
