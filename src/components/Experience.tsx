import { experience } from "../data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Experience() {
  return (
    <section id="experience" className="scroll-mt-24 border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          index="02"
          title="Experience"
          blurb="Four years of production backend work, newest first. Every number below is from a system I actually shipped."
        />

        <div className="relative">
          {/* Timeline rail */}
          <div
            className="absolute bottom-2 left-[7px] top-2 w-px bg-line md:left-[9px]"
            aria-hidden="true"
          />

          <div className="space-y-12 md:space-y-14">
            {experience.map((job, i) => (
              <Reveal key={job.company} delay={Math.min(i * 0.06, 0.2)}>
                <article className="relative pl-10 md:pl-14">
                  {/* Node */}
                  <span
                    className={`absolute left-0 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 md:h-5 md:w-5 ${
                      i === 0 ? "border-amber-glow" : "border-faint"
                    }`}
                    aria-hidden="true"
                  >
                    {i === 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-glow" />}
                  </span>

                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="font-display text-xl font-semibold tracking-tight text-fog md:text-2xl">
                      {job.role}{" "}
                      <span className="text-dim">
                        · <span className="text-amber-glow/90">{job.company}</span>
                      </span>
                    </h3>
                    <span className="font-mono text-xs text-faint md:text-[13px]">
                      {job.dates} · {job.location}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2.5">
                    {job.bullets.map((bullet) => (
                      <li key={bullet.slice(0, 32)} className="flex gap-3 leading-relaxed text-dim">
                        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-glow/70" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
