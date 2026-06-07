import { CHANCE_DEFINITION } from "@/data/other/glossary";
import { dpCardLight } from "@/components/ui/theme";

type Props = {
  className?: string;
};

export function ChanceDefinitionNote({ className = "mt-3" }: Props) {
  return (
    <aside
      className={`${dpCardLight} p-3 border-l-4 border-zinc-300 ${className}`}
    >
      <p className="text-xs text-zinc-600 leading-relaxed">
        <span className="font-bold text-zinc-800">
          「{CHANCE_DEFINITION.term}」とは　
        </span>
        {CHANCE_DEFINITION.body}
      </p>
    </aside>
  );
}
