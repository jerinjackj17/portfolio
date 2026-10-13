import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { projects, profile } from "../data";
import SectionHeader from "./SectionHeader";

export default function Projects() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState<string | null>(projects[0].index);

  return (
    <section
      id="projects"
      className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-24 md:px-8 md:pt-36"
    >
      <SectionHeader title="Projects" />
      <p className="mt-4 font-mono text-xs text-faint">
        shipped things. click one to open it.
      </p>

      <div className="mt-6 border-t border-ink/70">
        {projects.map((p) => {
          const isOpen = open === p.index;
          return (
            <article key={p.index} className="border-b border-rule">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : p.index)}
                aria-expanded={isOpen}
                className="group flex w-full items-baseline gap-4 py-6 text-left"
              >
                <span className="tnum shrink-0 font-mono text-sm text-flame-deep">
                  {p.index}
                </span>
                <h3 className="font-display text-2xl font-semibold tracking-tight text-ink group-hover:text-flame-deep md:text-[1.7rem]">
                  {p.title}
                </h3>
                <span
                  aria-hidden="true"
                  className="ml-auto shrink-0 font-mono text-sm text-faint transition-transform"
                  style={{
                    transform: isOpen ? "rotate(45deg)" : "none",
                    display: "inline-block",
                  }}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="max-w-3xl space-y-3 pb-2 text-[15px] leading-relaxed text-ink/90">
                    {p.description.map((d, i) => (
                      <p key={i}>{d}</p>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
                    <p className="font-mono text-xs text-smoke">{p.stack}</p>
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noreferrer"
                      className="u-link font-mono text-xs uppercase tracking-[0.16em] text-ink"
                    >
                      code →
                    </a>
                  </div>
                </motion.div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
