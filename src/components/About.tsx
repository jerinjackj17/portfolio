import { about } from "../data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function About() {
  return (
    <section id="about" className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading index="01" title="About" />
        <div className="grid gap-10 md:grid-cols-[1fr_320px] md:gap-16">
          <Reveal>
            <div className="space-y-5 text-lg leading-relaxed text-dim">
              {about.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-1">
            {about.stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.08} className="bg-panel">
                <div className="flex h-full flex-col justify-center gap-1 px-6 py-5">
                  <span className="font-display text-3xl font-bold tabular-nums text-amber-glow md:text-4xl">
                    {stat.value}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider text-faint">
                    {stat.label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
