import { motion, useReducedMotion } from "framer-motion";

export default function SectionHeader({ title }: { title: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="border-t-2 border-ink pt-6"
    >
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-smoke">
        {title.toLowerCase()}
      </p>
      <h2 className="mt-4 font-display text-4xl tracking-tight text-ink md:text-6xl">
        {title}
      </h2>
    </motion.div>
  );
}
