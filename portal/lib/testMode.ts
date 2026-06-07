/**
 * テスト用リセットボタンの表示判定。
 * - 開発時: 常に表示
 * - 本番: 未設定なら表示（プロトタイプ期間）。false のときのみ非表示
 */
export function isTestToolsEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_ENABLE_TEST_TOOLS;
  if (flag === "false") return false;
  if (flag === "true") return true;
  if (process.env.NODE_ENV === "development") return true;
  return flag === undefined || flag === "";
}
