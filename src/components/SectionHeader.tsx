export default function SectionHeader({
  index,
  title,
}: {
  index: string;
  title: string;
}) {
  return (
    <div className="border-t-2 border-ink pt-4">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-smoke">
        <span className="text-flame-deep">{index}</span>
        <span className="mx-2 text-faint">/</span>
        {title.toLowerCase()}
      </p>
      <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink md:text-5xl">
        {title}
      </h2>
    </div>
  );
}
