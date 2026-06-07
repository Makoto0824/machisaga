/** public 配下のアセットパス（Vercel ではルート直下） */
export function publicPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}
