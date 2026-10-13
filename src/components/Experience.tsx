import { experience } from "../data";
import SectionHeader from "./SectionHeader";

export default function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-20 md:px-8 md:pt-28">
      <SectionHeader index="02" title="Experience" />
      <p className="mt-4 font-mono text-xs text-faint">release notes, newest first.</p>
      <div className="mt-6">
        {experience.map((e) => (
          <article key={e.version} className="border-t border-rule py-8 first:border-t-0 first:pt-2">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="tnum font-mono text-sm font-medium text-flame-deep">
                {e.version}
              </span>
              <h3 className="font-display text-2xl font-medium tracking-tight text-ink">
                {e.company}
              </h3>
            </div>
            <p className="tnum mt-1 font-mono text-xs uppercase tracking-[0.14em] text-smoke">
              {e.role} · {e.dates} · {e.location}
            </p>
            <ul className="mt-4 max-w-3xl space-y-2.5">
              {e.bullets.map((b, i) => (
                <li
                  key={i}
                  className="border-l-2 border-rule pl-4 text-[15px] leading-relaxed text-ink/90"
                >
                  {b}
                </li>
              ))}
            </ul>
          </article>
        ))}
        <div className="border-t border-rule" />
      </div>
    </section>
  );
}
