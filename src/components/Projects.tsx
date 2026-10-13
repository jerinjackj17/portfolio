import { aiLab, profile, projects } from "../data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="scroll-mt-24 border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          index="03"
          title="Projects"
          blurb="Systems I built end to end. The first three are shipped work; the AI Lab below is what I'm building now."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.title} delay={i * 0.08} className="h-full">
              <article className="group flex h-full flex-col rounded-xl border border-line bg-panel p-6 transition-colors duration-300 hover:border-amber-glow/40 md:p-7">
                <span className="font-mono text-xs text-amber-glow">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight text-fog">
                  {project.title}
                </h3>
                <div className="mt-4 flex-1 space-y-3 text-[15px] leading-relaxed text-dim">
                  {project.description.map((para) => (
                    <p key={para.slice(0, 28)}>{para}</p>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.stack.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-line bg-ink px-2 py-1 font-mono text-[11px] text-faint"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={project.codeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex w-fit items-center gap-2 font-mono text-sm text-dim transition-colors hover:text-amber-glow"
                >
                  <GitHubIcon className="h-4 w-4" />
                  Code on GitHub
                </a>
              </article>
            </Reveal>
          ))}
        </div>

        {/* AI Lab strip */}
        <Reveal className="mt-14">
          <div className="rounded-xl border border-amber-glow/25 bg-panel/60 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-2xl font-semibold tracking-tight text-fog">
                AI Lab <span className="text-amber-glow">· now building</span>
              </h3>
              <span className="flex items-center gap-2 font-mono text-xs text-faint">
                <span className="pulse-dot relative inline-block h-2 w-2 rounded-full bg-amber-glow" />
                in progress
              </span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {aiLab.map((item) => (
                <div
                  key={item.name}
                  className="rounded-lg border border-dashed border-line bg-ink/60 p-5"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-display text-lg font-semibold text-fog">{item.name}</h4>
                    <span className="rounded bg-amber-glow/10 px-2 py-0.5 font-mono text-[11px] text-amber-glow">
                      soon
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-faint">{item.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-dim">{item.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 font-mono text-xs text-faint">
              Live demos and repos land here as each one ships. Follow along on{" "}
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="text-amber-glow underline-offset-4 hover:underline"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
