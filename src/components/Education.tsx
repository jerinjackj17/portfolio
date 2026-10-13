import { education } from "../data";
import SectionHeader from "./SectionHeader";

export default function Education() {
  return (
    <section id="education" className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-20 md:px-8 md:pt-28">
      <SectionHeader index="05" title="Education" />
      <div className="mt-6 border-t border-ink/70">
        {education.map((e) => (
          <div
            key={e.degree}
            className="flex flex-col gap-1 border-b border-rule py-5 md:flex-row md:items-baseline md:justify-between md:gap-8"
          >
            <div>
              <h3 className="font-display text-xl font-medium tracking-tight text-ink">
                {e.degree}
              </h3>
              <p className="mt-1 text-[15px] text-smoke">{e.school}</p>
            </div>
            <p className="tnum shrink-0 font-mono text-xs uppercase tracking-[0.14em] text-smoke">
              {e.detail} · {e.dates}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
