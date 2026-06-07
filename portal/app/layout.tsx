import type { Metadata, Viewport } from "next";
import { M_PLUS_Rounded_1c, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-sans-jp",
});

const mplusRounded = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-rounded",
});

export const metadata: Metadata = {
  title: "まちサーガ",
  description: "地域のチャンス・ゲーム・イベントを楽しむまちサーガポータル",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`h-full ${notoSansJP.variable} ${mplusRounded.variable}`}
    >
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
