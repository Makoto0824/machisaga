import type { ExternalLink } from "@/data/other/types";
import { dpCardLight, dpLink } from "@/components/ui/theme";

type Props = {
  link: ExternalLink;
};

export function OtherLinkCard({ link }: Props) {
  return (
    <article className={`${dpCardLight} p-4`}>
      <h3 className="text-base font-bold text-zinc-900">{link.title}</h3>
      <p className="text-sm text-zinc-600 mt-2 leading-relaxed">{link.summary}</p>
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${dpLink} mt-3`}
      >
        {link.linkLabel}
      </a>
    </article>
  );
}
