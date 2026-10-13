import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { about } from "../data";
import SectionHeader from "./SectionHeader";

function Counter({
  num,
  prefix,
  suffix,
}: {
  num: number;
  prefix: string;
  suffix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion || num === 0) {
      setVal(num);
      return;
    }
    const controls = animate(0, num, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, reduceMotion, num]);

  const display = num === 0 ? "0" : `${prefix}${Math.round(val)}${suffix}`;
  const hot = suffix === "%" || num === 0;
  return (
    <span ref={ref} className={`tnum ${hot ? "text-flame-deep" : ""}`}>
      {display}
    </span>
  );
}

export default function About() {
  return (
    <section
      id="about"
      className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-20 md:px-8 md:pt-28"
    >
      <SectionHeader title="About" />
      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_1fr] md:gap-14">
        <div className="max-w-none space-y-5 text-[17px] leading-relaxed text-ink/90">
          {about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-smoke">
            career totals
          </p>
          <dl className="border-t border-ink/70">
            {about.stats.map((s) => (
              <div
                key={s.label}
                className="flex items-baseline justify-between gap-6 border-b border-rule py-3"
              >
                <dt className="text-[15px] text-smoke">{s.label}</dt>
                <dd className="font-display text-2xl font-semibold text-ink">
                  <Counter num={s.num} prefix={s.prefix} suffix={s.suffix} />
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
