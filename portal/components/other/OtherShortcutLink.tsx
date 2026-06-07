import Link from "next/link";
import { dpBtnSecondary } from "@/components/ui/theme";

type Props = {
  regionSlug: string;
  path: string;
  label: string;
};

export function OtherShortcutLink({ regionSlug, path, label }: Props) {
  return (
    <Link
      href={`/${regionSlug}/${path}`}
      className={`${dpBtnSecondary} text-center text-sm py-2.5`}
    >
      {label}
    </Link>
  );
}
