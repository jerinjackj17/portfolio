import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  careerFrames,
  TIMELINE_START,
  TIMELINE_END,
  type CareerFrame,
  type HotFrame,
} from "../data";

type Selected =
  | { kind: "career"; frame: CareerFrame }
  | { kind: "hot"; frame: HotFrame; parent: CareerFrame }
  | null;

interface TipState {
  x: number;
  y: number;
  below: boolean;
  title: string;
  story: string;
}

const HEAT_BG: Record<number, string> = {
  0: "bg-cool-1",
  1: "bg-cool-2",
  2: "bg-warm-1",
  3: "bg-hot",
};

const HEAT_TEXT: Record<number, string> = {
  0: "text-ink",
  1: "text-ink",
  2: "text-ink",
  3: "text-paper",
};

const pct = (start: number, end: number) =>
  ((end - start) / (TIMELINE_END - TIMELINE_START)) * 100;
const leftPct = (start: number) =>
  ((start - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100;

const TICKS = [2021, 2022, 2023, 2024, 2025, 2026];
const tickLeft = (year: number) => (((year - 2020) * 12 - 3) / 78) * 100;

function HandArrow() {
  return (
    <svg
      width="72"
      height="64"
      viewBox="0 0 72 64"
      fill="none"
      aria-hidden="true"
      className="text-flame"
    >
      <path
        d="M62 6 C 50 18, 34 30, 18 44 M 18 44 l 12 -3 M 18 44 l 3 -12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FlameGraph() {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<Selected>(() => {
    const gulf = careerFrames.find((f) => f.id === "gulf")!;
    const hot = gulf.children[0];
    return { kind: "hot", frame: hot, parent: gulf };
  });
  const [tip, setTip] = useState<TipState | null>(null);
  const [coarse, setCoarse] = useState(false);
  const frameRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const showTip = (id: string, title: string, story: string) => {
    if (coarse) return;
    const el = frameRefs.current.get(id);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = 240;
    const x = Math.min(Math.max(r.left + r.width / 2, w / 2 + 8), window.innerWidth - w / 2 - 8);
    const below = r.top < 150;
    setTip({ x, y: below ? r.bottom + 10 : r.top - 10, below, title, story });
  };

  const hideTip = () => setTip(null);

  const register = (id: string) => (el: HTMLDivElement | null) => {
    if (el) frameRefs.current.set(id, el);
    else frameRefs.current.delete(id);
  };

  const frameClass = (heat: number, extra = "") =>
    `absolute top-0 h-full overflow-hidden ${HEAT_BG[heat]} ${HEAT_TEXT[heat]} ${extra}`;

  return (
    <figure>
      <figcaption className="mb-3 font-mono text-xs text-smoke">
        <span className="text-flame-deep">fig. 01</span>
        <span className="mx-2 text-rule">/</span>
        career flame graph. width = time. hover a frame, click to inspect.
      </figcaption>

      <div className="overflow-x-auto pb-1">
        <div className="relative min-w-[720px] pt-20">
          {/* hand-drawn annotation */}
          <div
            className="pointer-events-none absolute left-[30%] top-0 flex items-start gap-1"
            aria-hidden="true"
          >
            <HandArrow />
            <span className="mt-1 -rotate-2 font-mono text-xs italic text-flame-deep">
              start here: the hottest frame
            </span>
          </div>

          {/* root bar */}
          <div className="relative h-7 w-full border border-ink/70">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
              career · apr 2020 → present
            </span>
            <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 font-mono text-[11px] text-smoke sm:block">
              4+ yrs
            </span>
          </div>

          {/* row 1: career frames */}
          <div className="relative mt-[3px] h-14 w-full">
            {careerFrames.map((f, i) => {
              const l = leftPct(f.start);
              const w = pct(f.start, f.end);
              const id = `c-${f.id}`;
              return (
                <motion.div
                  key={id}
                  ref={register(id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${f.label}, ${f.dates}. ${f.story}`}
                  onClick={() => {
                    setSelected({ kind: "career", frame: f });
                    hideTip();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected({ kind: "career", frame: f });
                    }
                  }}
                  onMouseEnter={() => showTip(id, `${f.label} · ${f.dates}`, f.story)}
                  onMouseLeave={hideTip}
                  onFocus={() => showTip(id, `${f.label} · ${f.dates}`, f.story)}
                  onBlur={hideTip}
                  className={`${frameClass(f.heat, "cursor-pointer border-r-2 border-paper")}`}
                  style={{ left: `calc(${l}% + 1px)`, ...(reduceMotion ? { width: `${w}%` } : {}) }}
                  initial={reduceMotion ? false : { width: 0 }}
                  whileInView={reduceMotion ? undefined : { width: `${w}%` }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w > 8 && (
                    <>
                      <span className="tnum block truncate px-2 pt-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                        {f.label}
                      </span>
                      <span className="tnum block truncate px-2 font-mono text-[10px] opacity-70">
                        {f.dates}
                      </span>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* row 2: hot frames */}
          <div className="relative mt-[3px] h-12 w-full">
            {careerFrames.map((f, i) =>
              f.children.map((c) => {
                const parentL = leftPct(f.start);
                const parentW = pct(f.start, f.end);
                const l = parentL + (c.offsetPct / 100) * parentW;
                const w = (c.widthPct / 100) * parentW;
                const id = `h-${c.id}`;
                return (
                  <motion.div
                    key={id}
                    ref={register(id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${c.label}. ${c.story}`}
                    onClick={() => {
                      setSelected({ kind: "hot", frame: c, parent: f });
                      hideTip();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected({ kind: "hot", frame: c, parent: f });
                      }
                    }}
                    onMouseEnter={() => showTip(id, c.label, c.story)}
                    onMouseLeave={hideTip}
                    onFocus={() => showTip(id, c.label, c.story)}
                    onBlur={hideTip}
                    className={`${frameClass(c.heat, "cursor-pointer border-r-2 border-paper")}`}
                    style={{ left: `calc(${l}% + 1px)`, ...(reduceMotion ? { width: `${w}%` } : {}) }}
                    initial={reduceMotion ? false : { width: 0 }}
                    whileInView={reduceMotion ? undefined : { width: `${w}%` }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.9, delay: 0.45 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                    >
                    {w > 8 && (
                      <span className="tnum block truncate px-2 pt-2.5 font-mono text-[10px] uppercase tracking-[0.12em]">
                        {c.label}
                      </span>
                    )}
                  </motion.div>
                );
              }),
            )}
          </div>

          {/* x axis */}
          <div className="relative mt-2 h-5 w-full border-t border-rule">
            {TICKS.map((y) => (
              <span
                key={y}
                className="tnum absolute top-1 -translate-x-1/2 font-mono text-[10px] text-faint"
                style={{ left: `${tickLeft(y)}%` }}
              >
                {y}
              </span>
            ))}
            <span className="tnum absolute right-0 top-1 font-mono text-[10px] text-faint">
              time →
            </span>
          </div>
        </div>
      </div>

      <p className="mt-1 font-mono text-[11px] text-faint sm:hidden">
        → scroll sideways to see the whole graph. tap a frame to inspect it.
      </p>

      {/* legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-smoke">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 bg-cool-1 ring-1 ring-rule" />
          <span className="inline-block h-3 w-3 bg-cool-2 ring-1 ring-rule" />
          <span className="inline-block h-3 w-3 bg-warm-1 ring-1 ring-rule" />
          <span className="inline-block h-3 w-3 bg-hot" />
          cooler → hotter
        </span>
        <span>child frames: the stories worth zooming into, sized for reading</span>
      </div>

      {/* detail strip */}
      <div className="mt-5 border-y border-ink/70 py-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
            frame detail
          </span>
          {selected && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="u-link font-mono text-[11px] uppercase tracking-[0.18em] text-smoke"
            >
              reset view ×
            </button>
          )}
        </div>
        {selected ? (
          <motion.div
            key={selected.frame.id}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="font-mono text-xs text-flame-deep">
              {selected.kind === "hot"
                ? `${selected.parent.label} / ${selected.frame.label}`
                : `${selected.frame.label} · ${selected.frame.dates}`}
            </p>
            <p className="mt-2 max-w-2xl font-display text-xl leading-snug text-ink">
              {selected.frame.story}
            </p>
            <ul className="mt-3 max-w-3xl">
              {selected.frame.details.map((d, i) => (
                <li
                  key={i}
                  className="border-t border-rule py-2 text-[15px] leading-relaxed text-ink/90 first:border-t-0"
                >
                  {d}
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          <p className="font-mono text-sm text-faint">
            click any frame above to inspect it.
          </p>
        )}
      </div>

      {/* floating tooltip */}
      {tip && (
        <div
          className="pointer-events-none fixed z-50 w-60 border border-ink/80 bg-paper px-3 py-2 shadow-[4px_4px_0_0_rgba(26,24,21,0.12)]"
          style={{
            left: tip.x,
            top: tip.y,
            transform: `translate(-50%, ${tip.below ? "0" : "-100%"})`,
          }}
          role="tooltip"
        >
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-flame-deep">
            {tip.title}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-ink">{tip.story}</p>
          <p className="mt-1 font-mono text-[10px] text-faint">click to inspect →</p>
        </div>
      )}
    </figure>
  );
}
