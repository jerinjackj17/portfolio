import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { experience } from "../data";
import SectionHeader from "./SectionHeader";

export default function Experience() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState<string | null>(experience[0].company);
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.85", "end 0.55"],
  });
  const spineDraw = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  return (
    <section
      id="experience"
      className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-20 md:px-8 md:pt-28"
    >
      <SectionHeader title="Experience" />
      <p className="mt-4 font-mono text-xs text-faint">
        newest first. click a role to open it.
      </p>

      <div ref={listRef} className="relative mt-8 border-l border-ink/40">
        {/* spine draws itself in on scroll */}
        <motion.span
          aria-hidden="true"
          className="absolute bottom-0 left-0 top-0 w-[2px] origin-top bg-flame"
          style={{ scaleY: reduceMotion ? 1 : spineDraw }}
        />
        {experience.map((e, idx) => {
          const isOpen = open === e.company;
          return (
            <motion.div
              key={e.company}
              initial={reduceMotion ? false : { opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.45,
                delay: idx * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative pb-2 pl-8 md:pl-10"
            >
              <span
                aria-hidden="true"
                className={`absolute -left-[7px] top-2 h-3.5 w-3.5 rounded-full border-2 ${
                  isOpen
                    ? "border-flame bg-flame"
                    : "border-ink/50 bg-paper"
                }`}
              />
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : e.company)}
                aria-expanded={isOpen}
                className="group block w-full text-left"
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-ink group-hover:text-flame-deep md:text-[1.7rem]">
                    {e.company}
                  </h3>
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
                </div>
                <p className="tnum mt-1 font-mono text-xs uppercase tracking-[0.14em] text-smoke">
                  {e.role} · {e.dates} · {e.location}
                </p>
              </button>
              {isOpen && (
                <motion.ul
                  initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-4 max-w-3xl space-y-2.5 overflow-hidden"
                >
                  {e.bullets.map((b, i) => (
                    <li
                      key={i}
                      className="border-l-2 border-rule pl-4 text-[15px] leading-relaxed text-ink/90"
                    >
                      {b}
                    </li>
                  ))}
                </motion.ul>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
