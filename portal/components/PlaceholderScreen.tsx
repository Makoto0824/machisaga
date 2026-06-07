import Link from "next/link";
import { MobileFrame } from "@/components/MobileFrame";

type Props = {
  regionSlug: string;
  title: string;
  description: string;
};

export function PlaceholderScreen({ regionSlug, title, description }: Props) {
  return (
    <MobileFrame>
      <main className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center min-h-0">
        <h1 className="text-xl font-bold text-zinc-900">{title}</h1>
        <p className="text-sm text-zinc-600 max-w-xs">{description}</p>
        <Link
          href={`/${regionSlug}/chance`}
          className="text-sm font-bold text-blue-600 underline"
        >
          チャンスへ戻る
        </Link>
      </main>
    </MobileFrame>
  );
}
