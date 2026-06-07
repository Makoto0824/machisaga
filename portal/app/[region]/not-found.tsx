import Link from "next/link";
import { REGION_SLUGS } from "@/data/regions";

export default function RegionNotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-bold text-zinc-900">地域が見つかりません</h1>
      <p className="text-sm text-zinc-600">
        指定された地域のチャンスは存在しません。
      </p>
      <ul className="flex flex-col gap-2 text-sm">
        {REGION_SLUGS.map((slug) => (
          <li key={slug}>
            <Link href={`/${slug}/chance`} className="text-blue-600 underline">
              /{slug}/chance
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
