import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "その他・案内",
  description:
    "まちサーガの紹介、FAQ、お問い合わせ、プライバシーポリシー、利用規約。",
};

export default function OtherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
