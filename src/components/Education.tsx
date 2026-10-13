import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { education } from "../data";
import SectionHeader from "./SectionHeader";

export default function Education() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState<string | null>(education[0].degree);

  return (
    <section
      id="education"
      className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-20 md:px-8 md:pt-28"
    >
      <SectionHeader title="Education" />
      <div className="mt-6 border-t border-ink/70">
        {education.map((e) => {
          const isOpen = open === e.degree;
          return (
            <div key={e.degree} className="border-b border-rule">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : e.degree)}
                aria-expanded={isOpen}
                className="group flex w-full flex-col gap-1 py-5 text-left md:flex-row md:items-baseline md:justify-between md:gap-8"
              >
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight text-ink group-hover:text-flame-deep">
                    {e.degree}
                  </h3>
                  <p className="mt-1 text-[15px] text-smoke">{e.school}</p>
                </div>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="tnum font-mono text-xs uppercase tracking-[0.14em] text-smoke">
                    {e.dates}
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-sm text-faint transition-transform"
                    style={{
                      transform: isOpen ? "rotate(45deg)" : "none",
                      display: "inline-block",
                    }}
                  >
                    +
                  </span>
                </span>
              </button>
              {isOpen && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="tnum pb-5 font-mono text-sm text-flame-deep">
                    {e.detail}
                  </p>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
