/**
 * 現在のユーザーIDを返す。
 * 初期Web版では demo-user-001。
 * LINE LIFF対応時はこの関数内だけを差し替える。
 */
export function getCurrentUserId(): string {
  return "demo-user-001";
}
