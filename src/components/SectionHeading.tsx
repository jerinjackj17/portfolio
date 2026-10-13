import Reveal from "./Reveal";

interface SectionHeadingProps {
  index: string;
  title: string;
  blurb?: string;
}

export default function SectionHeading({ index, title, blurb }: SectionHeadingProps) {
  return (
    <Reveal className="mb-10 md:mb-14">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-sm text-amber-glow">{index}</span>
        <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-fog">
          {title}
        </h2>
        <span className="hidden md:block h-px flex-1 bg-line" aria-hidden="true" />
      </div>
      {blurb && <p className="mt-3 max-w-2xl text-dim leading-relaxed">{blurb}</p>}
    </Reveal>
  );
}
