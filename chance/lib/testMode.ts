/** 開発時、または NEXT_PUBLIC_ENABLE_TEST_TOOLS=true のとき表示 */
export function isTestToolsEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENABLE_TEST_TOOLS === "true"
  );
}
