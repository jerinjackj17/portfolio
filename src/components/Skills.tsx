import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { skillGroups } from "../data";
import SectionHeader from "./SectionHeader";

const CATEGORIES: { id: string; label: string; groups: number[] }[] = [
  { id: "languages", label: "languages", groups: [0] },
  { id: "backend", label: "backend", groups: [1, 2] },
  { id: "data", label: "data", groups: [3, 4] },
  { id: "cloud", label: "cloud & devops", groups: [5, 6, 7] },
  { id: "practices", label: "practices", groups: [8, 9, 10] },
];

export default function Skills() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState("backend");
  const cat = CATEGORIES.find((c) => c.id === active)!;

  return (
    <section
      id="skills"
      className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-24 md:px-8 md:pt-36"
    >
      <SectionHeader title="Skills" />
      <p className="mt-4 font-mono text-xs text-faint">
        pick a shelf. everything here has shipped somewhere.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            aria-pressed={active === c.id}
            className={`border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
              active === c.id
                ? "border-ink bg-ink text-paper"
                : "border-ink/70 text-ink hover:bg-ink hover:text-paper"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <motion.div
        key={active}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-6 grid gap-x-12 md:grid-cols-2"
      >
        {cat.groups.map((gi) => {
          const g = skillGroups[gi];
          return (
            <div key={g.name} className="border-t border-ink/70 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-flame-deep">
                {g.name}
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/90">
                {g.items}
              </p>
              <p className="mt-2 font-mono text-xs italic text-smoke">
                where it shipped: {g.usedAt}
              </p>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
