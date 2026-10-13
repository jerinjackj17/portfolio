import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/* "catch the slow query": a 30-second arcade toy for the hero.
   Query chips fall; click the slow ones (>500ms) to optimize them.
   Let 3 slow ones slip past and the game is over. */

interface ChipT {
  id: number;
  x: number; // percent across the panel
  y: number; // px from the top
  ms: number;
  label: string;
  slow: boolean;
  state: "falling" | "hit" | "wrong";
}

const SLOW_POOL = [
  { label: "GET /reports/monthly", ms: 2400 },
  { label: "POST /payments/charge", ms: 1800 },
  { label: "GET /audit/export", ms: 3200 },
  { label: "PUT /users/{id}", ms: 950 },
  { label: "GET /search", ms: 1400 },
  { label: "POST /reports/run", ms: 2100 },
];

const FAST_POOL = [
  { label: "GET /health", ms: 12 },
  { label: "GET /auth/me", ms: 48 },
  { label: "GET /payments/balance", ms: 96 },
  { label: "DELETE /cache", ms: 30 },
  { label: "GET /version", ms: 8 },
];

const PANEL_H = 400;
const FALL_SPEED = 88; // px per second: ~4.5s to cross the panel
const BEST_KEY = "jj-sqg-best";

function pick(pool: { label: string; ms: number }[]) {
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function SlowQueryGame() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [chips, setChips] = useState<ChipT[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [best, setBest] = useState<number>(() => {
    try {
      return Number(window.localStorage.getItem(BEST_KEY) ?? 0) || 0;
    } catch {
      return 0;
    }
  });
  const [staticCount, setStaticCount] = useState(0);
  const idRef = useRef(0);
  // Mirror of mutable game state so interval callbacks stay pure.
  const chipsRef = useRef<ChipT[]>([]);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const scoreRef = useRef(0);
  const missesRef = useRef(0);

  const syncChips = (next: ChipT[]) => {
    chipsRef.current = next;
    setChips(next);
  };

  const endGame = () => {
    const finalScore = scoreRef.current;
    setPhase("over");
    setBest((b) => {
      const nb = Math.max(b, finalScore);
      try {
        window.localStorage.setItem(BEST_KEY, String(nb));
      } catch {
        /* storage unavailable: best is session-only */
      }
      return nb;
    });
  };

  const start = () => {
    idRef.current = 0;
    scoreRef.current = 0;
    missesRef.current = 0;
    syncChips([]);
    setScore(0);
    setMisses(0);
    setStaticCount(0);
    setPhase("playing");
  };

  const spawn = () => {
    const slow = Math.random() < 0.55;
    const p = slow ? pick(SLOW_POOL) : pick(FAST_POOL);
    idRef.current += 1;
    const chip: ChipT = {
      id: idRef.current,
      x: 18 + Math.random() * 64,
      y: -30,
      ms: p.ms,
      label: p.label,
      slow,
      state: "falling",
    };
    const cur = chipsRef.current;
    syncChips(cur.length > 7 ? cur : [...cur, chip]);
  };

  // falling mode: spawn + gravity + miss detection
  useEffect(() => {
    if (phase !== "playing" || reduceMotion) return;
    const spawnId = window.setInterval(() => {
      if (phaseRef.current === "playing") spawn();
    }, 1050);
    const tickId = window.setInterval(() => {
      if (phaseRef.current !== "playing") return;
      let missed = 0;
      const next: ChipT[] = [];
      for (const c of chipsRef.current) {
        if (c.state !== "falling") {
          next.push(c);
          continue;
        }
        const y = c.y + FALL_SPEED * 0.05;
        if (y > PANEL_H) {
          if (c.slow) missed += 1;
          continue;
        }
        next.push({ ...c, y });
      }
      syncChips(next);
      if (missed > 0) {
        missesRef.current += missed;
        setMisses(missesRef.current);
        if (missesRef.current >= 3) {
          window.clearInterval(spawnId);
          window.clearInterval(tickId);
          syncChips([]);
          endGame();
        }
      }
    }, 50);
    return () => {
      window.clearInterval(spawnId);
      window.clearInterval(tickId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduceMotion]);

  // reduced-motion mode: one static chip at a time, 10 per round
  useEffect(() => {
    if (phase !== "playing" || !reduceMotion) return;
    if (staticCount >= 10) {
      endGame();
      return;
    }
    if (chipsRef.current.length === 0) {
      const t = window.setTimeout(() => {
        if (phaseRef.current === "playing") spawn();
      }, 350);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduceMotion, chips, staticCount]);

  const clickChip = (id: number) => {
    const c = chipsRef.current.find((x) => x.id === id);
    if (!c || c.state !== "falling") return;
    if (c.slow) {
      scoreRef.current += 100;
      setScore(scoreRef.current);
      syncChips(
        chipsRef.current.map((x) =>
          x.id === id ? { ...x, state: "hit" as const } : x,
        ),
      );
    } else {
      scoreRef.current = Math.max(0, scoreRef.current - 50);
      setScore(scoreRef.current);
      syncChips(
        chipsRef.current.map((x) =>
          x.id === id ? { ...x, state: "wrong" as const } : x,
        ),
      );
    }
    if (reduceMotion) setStaticCount((n) => n + 1);
    window.setTimeout(() => {
      syncChips(chipsRef.current.filter((x) => x.id !== id));
    }, 650);
  };

  return (
    <div className="border border-ink/70 bg-paper p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
          catch the slow query
        </p>
        <p className="tnum font-mono text-[11px] text-faint">
          score {score} · best {best}
        </p>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-ink/80">
        Queries are falling. Click the slow ones (over 500ms) to optimize them.
        Let 3 slow ones slip past and the deploy fails. Clicking a fast one
        costs 50 points.
      </p>

      <div
        className="relative mt-3 overflow-hidden border border-rule bg-cool-1"
        style={{ height: reduceMotion ? 220 : PANEL_H }}
        role={phase === "playing" ? "img" : undefined}
        aria-label={
          phase === "playing"
            ? "Falling query chips. Click the ones slower than 500 milliseconds."
            : undefined
        }
      >
        {phase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="font-mono text-xs text-smoke">
              the on-call arcade. 30 seconds of fame.
            </p>
            <button
              type="button"
              onClick={start}
              className="border border-ink bg-ink px-6 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-paper transition-opacity hover:opacity-85"
            >
              start →
            </button>
          </div>
        )}

        {phase === "playing" &&
          chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => clickChip(c.id)}
              disabled={c.state !== "falling"}
              className={`tnum absolute -translate-x-1/2 whitespace-nowrap border px-2.5 py-1.5 font-mono text-[11px] transition-colors ${
                c.state === "hit"
                  ? "border-ok bg-paper text-ok"
                  : c.state === "wrong"
                    ? "border-flame-deep bg-paper text-flame-deep"
                    : "border-ink/60 bg-paper text-ink hover:border-ink"
              } ${c.state !== "falling" ? "cursor-default" : "cursor-pointer"}`}
              style={
                reduceMotion
                  ? { left: "50%", top: 80 }
                  : { left: `${c.x}%`, top: c.y }
              }
              aria-label={`${c.label}, ${c.ms} milliseconds${c.slow ? ", slow" : ""}`}
            >
              {c.state === "hit" ? (
                <>
                  {c.label} · {c.ms}ms <span className="text-ok">→ 38ms</span>
                </>
              ) : c.state === "wrong" ? (
                <>that one was fine! −50</>
              ) : (
                <>
                  {c.label} · {c.ms}ms
                </>
              )}
            </button>
          ))}

        {phase === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-paper/95 p-6 text-center">
            <p className="font-display text-2xl font-semibold text-ink">
              deploy failed.
            </p>
            <p className="tnum font-mono text-xs text-smoke">
              score {score} · best {best}
            </p>
            <button
              type="button"
              onClick={start}
              className="border border-ink bg-ink px-6 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-paper transition-opacity hover:opacity-85"
            >
              play again →
            </button>
          </div>
        )}
      </div>

      {phase === "playing" && !reduceMotion && (
        <p className="tnum mt-2 font-mono text-[11px] text-faint">
          misses {misses}/3
        </p>
      )}
    </div>
  );
}
