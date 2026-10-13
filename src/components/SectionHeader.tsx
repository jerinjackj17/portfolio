export default function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-t-2 border-ink pt-4">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-smoke">
        {title.toLowerCase()}
      </p>
      <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        {title}
      </h2>
    </div>
  );
}
