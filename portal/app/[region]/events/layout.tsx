import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "イベント情報",
  description:
    "茂原市・茂原アスモ、参加店舗のイベント・セール情報をお知らせします。",
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
