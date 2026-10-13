import { motion, useReducedMotion } from "framer-motion";
import { hero, profile } from "../data";
import RequestTrace from "./RequestTrace";

export default function Hero() {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  };
  const item = {
    hidden: reduceMotion ? {} : { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section id="top" className="relative overflow-hidden pt-32 md:pt-40">
      <div className="blueprint blueprint-fade pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/70 px-3.5 py-1.5 font-mono text-xs text-dim md:text-[13px]">
              <span className="pulse-dot relative inline-block h-2 w-2 rounded-full bg-ok" />
              {hero.availability}
            </span>
          </motion.div>

          <motion.p
            variants={item}
            className="mt-7 font-mono text-sm uppercase tracking-[0.18em] text-amber-glow md:text-base"
          >
            {hero.eyebrow}
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-5 max-w-4xl font-display text-5xl font-bold leading-[1.04] tracking-tight text-fog md:text-7xl"
          >
            I build backend systems that{" "}
            <span className="text-amber-glow">stay fast under pressure.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-dim md:text-xl"
          >
            {hero.sub}
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="rounded-lg bg-amber-glow px-6 py-3 font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5"
            >
              View my work
            </a>
            <a
              href="#contact"
              className="rounded-lg border border-line bg-panel/60 px-6 py-3 font-semibold text-fog transition-colors duration-200 hover:border-dim/60 hover:bg-panel-2"
            >
              Get in touch
            </a>
            <span className="font-mono text-sm text-faint">{profile.location}</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 md:mt-16"
        >
          <RequestTrace />
        </motion.div>
      </div>
    </section>
  );
}
