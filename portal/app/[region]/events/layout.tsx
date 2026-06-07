import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "イベント情報",
  description:
    "茂原市・アスモの公式イベント情報への案内と、参加店舗のセール・イベント情報。",
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
