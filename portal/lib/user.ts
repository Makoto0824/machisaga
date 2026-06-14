/**
 * ユーザー ID の取得。
 * Supabase 利用時は Anonymous Auth、未設定時は端末 UUID。
 * LINE LIFF 対応時は lib/auth.ts の resolveUserId を差し替える。
 */
export {
  getCurrentUserId,
  isAuthReady,
  resolveUserId,
} from "@/lib/auth";
