type Props = {
  title: string;
  children: React.ReactNode;
  id?: string;
};

export function OtherSection({ title, children, id }: Props) {
  return (
    <section id={id} className="mt-6 scroll-mt-4">
      <h2 className="text-sm font-bold text-zinc-800 border-b-2 border-zinc-200 pb-2">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Paragraphs({ lines }: { lines: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      {lines.map((line) => (
        <p key={line} className="text-sm text-zinc-600 leading-relaxed">
          {line}
        </p>
      ))}
    </div>
  );
}

OtherSection.Paragraphs = Paragraphs;

export { Paragraphs as OtherParagraphs };
