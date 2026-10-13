import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/* Living page background, aquarium-style: backend log lines, tech chips,
   and tiny code snippets drift behind the content. Like fish, they scatter
   away from the cursor (or a touch point), briefly brighten, then settle
   back into the drift. The layer is pointer-events none; the cursor is
   tracked at window level.

   It also reacts to the playground via `jj:scenario` events: "slow-db" /
   "flood" incidents infect the log stream with warnings; a return to
   "healthy" plays a short recovery beat before calming down.

   Accent-colored keywords resolve through --accent, so the theme switcher
   recolors them too. Under prefers-reduced-motion the layer is fully static. */

type Mode = "calm" | "slow-db" | "flood" | "recovering";
type Kind = "log" | "chip" | "code";

interface BgItem {
  id: number;
  kind: Kind;
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
  "INFO  j.j.api.RequestLog : PUT /payments/pay_42 -> 200 in 61ms",
  "INFO  o.h.engine.jdbc.batch : batching 25 statements :: payments",
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

const CHIPS: string[] = [
  "java", "spring boot", "kafka", "postgres",
  "redis", "docker", "kubernetes", "react",
  "python", "aws", "maven", "junit",
];

const CODE: string[] = [
  "public ResponseEntity<Charge> charge(@RequestBody ChargeReq req) {",
  '@KafkaListener(topics = "audit-events", groupId = "billing")',
  "select /*+ INDEX(p idx_pay_merchant) */ * from payments p where p.merchant_id = ?",
];

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

const RADIUS = 170; // px: disturbance field around the cursor
const PUSH = 70; // px: max scatter distance
const OPACITY: Record<Kind, number> = { log: 0.45, chip: 0.5, code: 0.38 };

// Deterministic spread so logs, chips, and snippets interleave evenly.
function spread(n: number, seed: number): [number, number][] {
  const pts: [number, number][] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = 0; i < n; i++) {
    pts.push([
      3 + ((i * 37 + rnd() * 20) % 88),
      5 + ((i * 53 + rnd() * 14) % 86),
    ]);
  }
  return pts;
}

const LOG_ANCHORS = spread(14, 7);
const CHIP_ANCHORS = spread(12, 41);
const CODE_ANCHORS = spread(3, 99);

function makeItems(): BgItem[] {
  const t = performance.now() / 1000;
  const items: BgItem[] = [];
  let id = 0;
  const mk = (
    kind: Kind,
    xPct: number,
    yPct: number,
    text: string,
  ): BgItem => ({
    id: id++,
    kind,
    xPct: xPct + (Math.random() * 4 - 2),
    yPct: yPct + (Math.random() * 4 - 2),
    phase: Math.random() * Math.PI * 2,
    driftSpeed: 0.25 + Math.random() * 0.25,
    text,
    fadeT: t,
  });
  // interleave kinds so nothing clumps
  const logs = LOG_ANCHORS.map(([x, y]) => mk("log", x, y, pick(CALM)));
  const chips = CHIP_ANCHORS.map(([x, y], i) =>
    mk("chip", x, y, CHIPS[i % CHIPS.length]),
  );
  const code = CODE_ANCHORS.map(([x, y], i) =>
    mk("code", x, y, CODE[i % CODE.length]),
  );
  const buckets: BgItem[][] = [logs, chips, code];
  let more = true;
  while (more) {
    more = false;
    for (const b of buckets) {
      const it = b.shift();
      if (it) {
        items.push(it);
        more = true;
      }
    }
  }
  return items;
}

export default function SystemLogBackground() {
  const reduceMotion = useReducedMotion();
  const [items, setItems] = useState<BgItem[]>(() =>
    reduceMotion ? [] : makeItems(),
  );
  const itemsRef = useRef<BgItem[]>(items);
  itemsRef.current = items;
  const modeRef = useRef<Mode>("calm");
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const geoRef = useRef<{ dx: number; dy: number }[]>([]);
  if (geoRef.current.length !== items.length) {
    geoRef.current = items.map(() => ({ dx: 0, dy: 0 }));
  }
  const cursorRef = useRef({ x: -9999, y: -9999, t: -9999 });

  // Only the log lines change with incidents; chips and snippets persist.
  const retext = (mode: Mode, stagger = false) => {
    const t = performance.now() / 1000;
    const pool = POOLS[mode];
    let n = 0;
    setItems((prev) =>
      prev.map((it) => {
        if (it.kind !== "log") return it;
        const i = n++;
        return { ...it, text: pick(pool), fadeT: t + (stagger ? i * 0.12 : 0) };
      }),
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

  // Aliveness: every so often one log line picks up a fresh entry.
  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      const t = performance.now() / 1000;
      const pool = POOLS[modeRef.current];
      const logIds = itemsRef.current
        .filter((it) => it.kind === "log")
        .map((it) => it.id);
      if (!logIds.length) return;
      const target = logIds[Math.floor(Math.random() * logIds.length)];
      setItems((prev) =>
        prev.map((it) =>
          it.id === target ? { ...it, text: pick(pool), fadeT: t } : it,
        ),
      );
    }, 14000);
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
      const list = itemsRef.current;
      for (let i = 0; i < list.length; i++) {
        const l = list[i];
        const el = nodeRefs.current[i];
        if (!el) continue;
        const ax = (l.xPct / 100) * W;
        const ay = (l.yPct / 100) * H;
        const g = geoRef.current[i];
        if (!g) continue;
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
        el.style.opacity = (OPACITY[l.kind] * bright * fade).toFixed(3);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPoint);
      window.removeEventListener("pointerdown", onPoint);
    };
  }, [reduceMotion]);

  const renderItem = (it: BgItem, i: number) => {
    const ref = (el: HTMLDivElement | null) => {
      nodeRefs.current[i] = el;
    };
    if (it.kind === "chip") {
      return (
        <div key={it.id} ref={ref} className="absolute select-none">
          <span className="whitespace-nowrap border border-ink/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-smoke">
            {it.text}
          </span>
        </div>
      );
    }
    if (it.kind === "code") {
      return (
        <div key={it.id} ref={ref} className="absolute select-none">
          <p className="whitespace-nowrap font-mono text-[10px] leading-relaxed text-smoke">
            {it.text}
          </p>
        </div>
      );
    }
    return (
      <div key={it.id} ref={ref} className="absolute select-none">
        <p className="whitespace-nowrap font-mono text-[11px] leading-relaxed text-smoke">
          {highlight(it.text, it.id)}
        </p>
      </div>
    );
  };

  if (reduceMotion) {
    // Fully static: fixed faint elements, no animation, no cursor reaction.
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden"
      >
        {CALM.slice(0, 8).map((t, i) => (
          <p
            key={`s-log-${i}`}
            className="absolute whitespace-nowrap font-mono text-[11px] leading-relaxed text-smoke opacity-50"
            style={{ left: `${4 + (i % 3) * 30}%`, top: `${8 + i * 11}%` }}
          >
            {highlight(t, i)}
          </p>
        ))}
        {CHIPS.slice(0, 6).map((c, i) => (
          <p
            key={`s-chip-${i}`}
            className="absolute"
            style={{ left: `${10 + (i % 3) * 32}%`, top: `${14 + i * 13}%` }}
          >
            <span className="whitespace-nowrap border border-ink/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-smoke opacity-50">
              {c}
            </span>
          </p>
        ))}
        {CODE.slice(0, 2).map((c, i) => (
          <p
            key={`s-code-${i}`}
            className="absolute whitespace-nowrap font-mono text-[10px] text-smoke opacity-50"
            style={{ left: `${20 + i * 35}%`, top: `${30 + i * 37}%` }}
          >
            {c}
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
      {items.map((it, i) => renderItem(it, i))}
    </div>
  );
}
