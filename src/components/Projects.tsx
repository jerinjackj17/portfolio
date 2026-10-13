import { projects, aiLab, profile } from "../data";
import SectionHeader from "./SectionHeader";

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-20 md:px-8 md:pt-28">
      <SectionHeader index="03" title="Projects" />
      <div className="mt-6">
        {projects.map((p) => (
          <article key={p.index} className="border-t border-rule py-8 first:border-t-0 first:pt-2">
            <div className="flex items-baseline gap-4">
              <span className="tnum font-mono text-sm text-flame-deep">{p.index}</span>
              <h3 className="font-display text-2xl font-medium tracking-tight text-ink md:text-[1.7rem]">
                {p.title}
              </h3>
            </div>
            <div className="mt-3 max-w-3xl space-y-3 text-[15px] leading-relaxed text-ink/90">
              {p.description.map((d, i) => (
                <p key={i}>{d}</p>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-xs text-smoke">{p.stack}</p>
              <a href={profile.github} target="_blank" rel="noreferrer" className="u-link font-mono text-xs uppercase tracking-[0.16em] text-ink">
                code →
              </a>
            </div>
          </article>
        ))}
        <div className="border-t border-rule" />
      </div>

      <div className="mt-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-smoke">
          <span className="text-flame-deep">ai lab</span>
          <span className="mx-2 text-faint">·</span>
          now building
        </p>
        <div className="mt-4 border-t border-ink/70">
          {aiLab.map((a) => (
            <div
              key={a.name}
              className="flex flex-col gap-1 border-b border-rule py-4 md:flex-row md:items-baseline md:gap-6"
            >
              <div className="flex items-baseline gap-3 md:w-64 md:shrink-0">
                <span className="font-display text-xl font-medium text-ink">{a.name}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-flame-deep">
                  {a.status}
                </span>
              </div>
              <p className="text-[15px] leading-relaxed text-ink/85">{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
