import type { Metadata } from "next";
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
  title: "まちサーガ茂原ガチャ",
  description: "1日3回までチャレンジ！参加店舗で使えるクーポンが当たるガチャ",
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
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
