import { about } from "../data";
import SectionHeader from "./SectionHeader";

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-20 md:px-8 md:pt-28">
      <SectionHeader index="01" title="About" />
      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_1fr] md:gap-14">
        <div className="max-w-none space-y-5 text-[17px] leading-relaxed text-ink/90">
          {about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div>
          <p className="mb-3 font-mono text-xs text-smoke">
            <span className="text-flame-deep">table 01</span>
            <span className="mx-2 text-rule">/</span>
            career totals
          </p>
          <dl className="border-t border-ink/70">
            {about.stats.map((s) => (
              <div
                key={s.label}
                className="flex items-baseline justify-between gap-6 border-b border-rule py-3"
              >
                <dt className="text-[15px] text-smoke">{s.label}</dt>
                <dd className="tnum font-display text-2xl font-medium text-ink">
                  {s.value.includes("%") || s.value === "0" ? (
                    <span className="text-flame-deep">{s.value}</span>
                  ) : (
                    s.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-faint">
            figures as stated. no rounding for effect.
          </p>
        </div>
      </div>
    </section>
  );
}
