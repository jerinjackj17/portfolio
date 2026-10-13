import { education } from "../data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Education() {
  return (
    <section id="education" className="scroll-mt-24 border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading index="05" title="Education" />

        <div className="grid gap-6 md:grid-cols-2">
          {education.map((entry, i) => (
            <Reveal key={entry.degree} delay={i * 0.08} className="h-full">
              <article className="flex h-full flex-col rounded-xl border border-line bg-panel p-6 md:p-7">
                <h3 className="font-display text-xl font-semibold leading-snug tracking-tight text-fog">
                  {entry.degree}
                </h3>
                <p className="mt-2 text-dim">
                  {entry.school} · {entry.location}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 font-mono text-sm">
                  <span className="text-amber-glow">{entry.detail}</span>
                  <span className="text-faint">{entry.dates}</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
