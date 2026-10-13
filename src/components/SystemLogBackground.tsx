import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/* Living page background, aquarium-style: faint backend log lines drift
   behind the content. Like fish, they scatter away from the cursor (or a
   touch point), briefly brighten, then settle back into the drift.
   The layer is pointer-events none; the cursor is tracked at window level.

   It also reacts to the playground via `jj:scenario` events: "slow-db" /
   "flood" incidents infect the stream with warnings; a return to "healthy"
   plays a short recovery beat before calming down.

   Accent-colored keywords resolve through --accent, so the theme switcher
   recolors them too. Under prefers-reduced-motion the layer is fully static. */

type Mode = "calm" | "slow-db" | "flood" | "recovering";

interface FishLine {
  id: number;
  xPct: number;
  yPct: number;
  phase: number;
  driftSpeed: number;
  text: string;
  fadeT: number; // seconds (performance.now()/1000) of last text change
}

const CALM: string[] = [
  "INFO  o.s.b.w.embedded.tomcat : Tomcat started on port 8080 (http)",
  "INFO  o.s.boot.SpringApplication : Started PortfolioApp in 2.341 seconds",
  "INFO  com.zaxxer.hikari.HikariDataSource : HikariPool-1 - Pool stats (total=10, active=2, idle=8)",
  "INFO  j.j.api.RequestLog : GET /payments/balance -> 200 in 96ms",
  "INFO  o.a.k.c.c.internals.ConsumerCoordinator : [Consumer clientId=payments-1] 42 records from audit-events",
  "INFO  j.j.api.RequestLog : POST /payments/charge -> 201 in 210ms",
  "INFO  [javac] compiling 14 source files to /target/classes",
  "INFO  j.j.rag.Pipeline : chunk -> embed -> retrieve -> generate in 412ms (top-k 4, citations 3)",
  "INFO  j.j.api.RequestLog : GET /health -> 200 in 12ms",
  "INFO  o.a.k.c.producer : [Producer clientId=audit-1] 128 records sent to audit-events",
  "INFO  j.j.api.RequestLog : DELETE /cache -> 204 in 30ms",
  "INFO  com.zaxxer.hikari.HikariDataSource : HikariPool-1 - Pool stats (total=10, active=1, idle=9)",
];

const SLOW_DB: string[] = [
  "WARN  com.zaxxer.hikari.pool.HikariPool : HikariPool-1 - Thread starvation or clock leap detected",
  "WARN  j.j.db.SlowQuery : SLOW QUERY 2431ms :: select * from payments where merchant_id = ?",
  "WARN  com.zaxxer.hikari.pool.HikariPool : HikariPool-1 - Pool stats (total=10, active=10, idle=0, waiting=14)",
  "ERROR j.j.db.QueryTimeout : query timed out after 3000ms :: /reports/monthly",
  "WARN  j.j.db.SlowQuery : SLOW QUERY 1980ms :: select * from audit_events order by ts desc",
];

const FLOOD: string[] = [
  "WARN  j.j.api.RateLimit : 429 throttled :: POST /payments/charge",
  "WARN  j.j.api.RequestLog : POST /payments/charge -> 200 in 1840ms (queue depth 312)",
  "INFO  o.a.k.c.producer : [Producer clientId=audit-1] 1204 records sent to audit-events",
  "WARN  j.j.api.RateLimit : 429 throttled :: GET /search",
];

const RECOVERING: string[] = [
  "INFO  com.zaxxer.hikari.HikariDataSource : HikariPool-1 - Pool stats (total=10, active=1, idle=9) :: pool healthy",
  "INFO  j.j.api.RequestLog : GET /payments/balance -> 200 in 38ms :: p99 back to 42ms",
  "INFO  j.j.ops.Incident : incident resolved :: all clear",
];

const POOLS: Record<Mode, string[]> = {
  calm: CALM,
  "slow-db": SLOW_DB,
  flood: FLOOD,
  recovering: RECOVERING,
};

const HOT = ["ERROR", "SLOW QUERY", "timed out", "p99 back", "429", "throttled"];

function highlight(text: string, key: number): ReactNode[] {
  const pattern = new RegExp(
    `(WARN|${HOT.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g",
  );
  const parts = text.split(pattern);
  return parts.map((p, i) => {
    const cls =
      p === "WARN" ? "text-warn" : HOT.includes(p) ? "text-flame" : undefined;
    return cls ? (
      <span key={`${key}-${i}`} className={cls}>
        {p}
      </span>
    ) : (
      <span key={`${key}-${i}`}>{p}</span>
    );
  });
}

function pick(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

const LINE_COUNT = 10;
const RADIUS = 170; // px: disturbance field around the cursor
const PUSH = 70; // px: max scatter distance
const BASE_OPACITY = 0.45;

const ANCHORS: [number, number][] = [
  [6, 12], [70, 8], [35, 26], [82, 30], [12, 44],
  [58, 52], [88, 62], [28, 70], [64, 82], [8, 88],
];

function makeLines(): FishLine[] {
  const t = performance.now() / 1000;
  return ANCHORS.map(([x, y], i) => ({
    id: i,
    xPct: x + (Math.random() * 4 - 2),
    yPct: y + (Math.random() * 4 - 2),
    phase: Math.random() * Math.PI * 2,
    driftSpeed: 0.25 + Math.random() * 0.25,
    text: pick(CALM),
    fadeT: t,
  }));
}

export default function SystemLogBackground() {
  const reduceMotion = useReducedMotion();
  const [lines, setLines] = useState<FishLine[]>(() =>
    reduceMotion ? [] : makeLines(),
  );
  const linesRef = useRef<FishLine[]>(lines);
  linesRef.current = lines;
  const modeRef = useRef<Mode>("calm");
  const nodeRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const geoRef = useRef<{ dx: number; dy: number }[]>(
    ANCHORS.map(() => ({ dx: 0, dy: 0 })),
  );
  const cursorRef = useRef({ x: -9999, y: -9999, t: -9999 });

  const retext = (mode: Mode, stagger = false) => {
    const t = performance.now() / 1000;
    const pool = POOLS[mode];
    setLines((prev) =>
      prev.map((l, i) => ({
        ...l,
        text: pick(pool),
        fadeT: t + (stagger ? i * 0.12 : 0),
      })),
    );
  };

  // Incident infection: react to playground scenario changes.
  useEffect(() => {
    if (reduceMotion) return;
    const onScenario = (e: Event) => {
      const sc = (e as CustomEvent<{ scenario?: string }>).detail?.scenario;
      if (sc === "slow-db" || sc === "flood") {
        modeRef.current = sc;
        retext(sc, true);
      } else if (sc === "healthy") {
        const prev = modeRef.current;
        if (prev === "slow-db" || prev === "flood") {
          modeRef.current = "recovering";
          retext("recovering", true);
          window.setTimeout(() => {
            if (modeRef.current === "recovering") {
              modeRef.current = "calm";
              retext("calm", true);
            }
          }, 7000);
        }
      }
    };
    window.addEventListener("jj:scenario", onScenario);
    return () => window.removeEventListener("jj:scenario", onScenario);
  }, [reduceMotion]);

  // Aliveness: every so often one line picks up a fresh log entry.
  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      const t = performance.now() / 1000;
      const pool = POOLS[modeRef.current];
      const idx = Math.floor(Math.random() * LINE_COUNT);
      setLines((prev) =>
        prev.map((l, i) =>
          i === idx ? { ...l, text: pick(pool), fadeT: t } : l,
        ),
      );
    }, 18000);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  // Aquarium loop: drift + cursor repulsion, written straight to the DOM
  // (no React re-renders at 60fps). Touch works via pointer events.
  useEffect(() => {
    if (reduceMotion) return;
    const onPoint = (e: PointerEvent) => {
      cursorRef.current = {
        x: e.clientX,
        y: e.clientY,
        t: performance.now() / 1000,
      };
    };
    window.addEventListener("pointermove", onPoint, { passive: true });
    window.addEventListener("pointerdown", onPoint, { passive: true });

    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const now = performance.now() / 1000;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cur = cursorRef.current;
      const cursorLive = now - cur.t < 2.5;
      const list = linesRef.current;
      for (let i = 0; i < list.length; i++) {
        const l = list[i];
        const el = nodeRefs.current[i];
        if (!el) continue;
        const ax = (l.xPct / 100) * W;
        const ay = (l.yPct / 100) * H;
        const g = geoRef.current[i];
        // gentle drift
        const driftX = Math.cos(now * l.driftSpeed * 0.7 + l.phase) * 8;
        const driftY = Math.sin(now * l.driftSpeed + l.phase) * 14;
        // scatter from the cursor
        let tx = 0;
        let ty = 0;
        let bright = 1;
        if (cursorLive) {
          const vx = ax - cur.x;
          const vy = ay - cur.y;
          const d = Math.hypot(vx, vy);
          if (d < RADIUS && d > 1) {
            const f = 1 - d / RADIUS;
            const push = f * PUSH;
            tx = (vx / d) * push;
            ty = (vy / d) * push;
            bright = 1 + f * 1.6;
          }
        }
        // ease back to the drift (the settle)
        g.dx += (tx - g.dx) * 0.14;
        g.dy += (ty - g.dy) * 0.14;
        // fade dip right after a text change
        const sinceFade = now - l.fadeT;
        const fade = sinceFade < 1 ? 0.2 + 0.8 * sinceFade : 1;
        el.style.transform = `translate(${(driftX + g.dx).toFixed(1)}px, ${(driftY + g.dy).toFixed(1)}px)`;
        el.style.opacity = (BASE_OPACITY * bright * fade).toFixed(3);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPoint);
      window.removeEventListener("pointerdown", onPoint);
    };
  }, [reduceMotion]);

  if (reduceMotion) {
    // Fully static: fixed faint lines, no animation, no cursor reaction.
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden"
      >
        {CALM.slice(0, 8).map((t, i) => (
          <p
            key={i}
            className="absolute font-mono text-[11px] leading-relaxed text-smoke opacity-50"
            style={{ left: `${4 + (i % 3) * 30}%`, top: `${8 + i * 11}%` }}
          >
            {highlight(t, i)}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden"
    >
      {lines.map((l, i) => (
        <p
          key={l.id}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
          className="absolute whitespace-nowrap font-mono text-[11px] leading-relaxed text-smoke"
          style={{ left: `${l.xPct}%`, top: `${l.yPct}%` }}
        >
          {highlight(l.text, l.id)}
        </p>
      ))}
    </div>
  );
}
