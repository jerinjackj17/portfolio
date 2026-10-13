import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

interface TraceRow {
  method: "GET" | "POST" | "PUT";
  path: string;
  latency: number; // ms, live-ticking
  base: number;
  rpm: string;
}

const initialRows: TraceRow[] = [
  { method: "GET", path: "/api/v1/payments/transfers", latency: 842, base: 842, rpm: "2.4k" },
  { method: "POST", path: "/api/v1/reports/reconciliation", latency: 1210, base: 1210, rpm: "310" },
  { method: "GET", path: "/api/v1/accounts/balance", latency: 96, base: 96, rpm: "8.1k" },
  { method: "POST", path: "/api/v1/events/audit", latency: 44, base: 44, rpm: "12k" },
  { method: "PUT", path: "/api/v1/search/customers", latency: 388, base: 388, rpm: "1.1k" },
];

const SCALE_MAX = 1400;

const methodStyles: Record<TraceRow["method"], string> = {
  GET: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  POST: "bg-sky-400/10 text-sky-300 border-sky-400/20",
  PUT: "bg-violet-400/10 text-violet-300 border-violet-400/20",
};

const jitter = (base: number) => Math.max(8, Math.round(base * (0.92 + Math.random() * 0.16)));

/**
 * The signature motif: a live request trace, the way an observability
 * dashboard would show it. Illustrative sample traffic, not real systems.
 */
export default function RequestTrace() {
  const reduceMotion = useReducedMotion();
  const [rows, setRows] = useState<TraceRow[]>(initialRows);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setRows((prev) => prev.map((r) => ({ ...r, latency: jitter(r.base) })));
    }, 1500);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <div
      className="overflow-hidden rounded-xl border border-line bg-panel/80 shadow-2xl shadow-black/50"
      role="img"
      aria-label="Illustrative live request trace showing API endpoint latencies"
    >
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2a2a33]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2a2a33]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2a2a33]" />
        </div>
        <span className="font-mono text-xs text-faint">request trace · live sample</span>
        <span className="flex items-center gap-1.5 font-mono text-xs text-ok">
          <span className="pulse-dot relative inline-block h-1.5 w-1.5 rounded-full bg-ok" />
          sampling
        </span>
      </div>

      {/* Column headers */}
      <div className="hidden grid-cols-[64px_1fr_110px_64px] items-center gap-3 border-b border-line px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-faint sm:grid md:grid-cols-[64px_1fr_140px_80px]">
        <span>method</span>
        <span>endpoint</span>
        <span>latency</span>
        <span className="text-right">p99</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-line/60">
        {rows.map((row, i) => {
          const pct = Math.min(100, (row.latency / SCALE_MAX) * 100);
          const p99 = Math.round(row.latency * 1.4);
          const p50 = Math.round(row.latency * 0.62);
          const active = hovered === i;
          return (
            <div
              key={row.path}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
              className={`cursor-default px-4 py-3 transition-colors duration-200 ${
                active ? "bg-panel-2" : ""
              }`}
            >
              <div className="grid grid-cols-[64px_1fr_64px] items-center gap-3 sm:grid-cols-[64px_1fr_110px_64px] md:grid-cols-[64px_1fr_140px_80px]">
                <span
                  className={`inline-block w-fit rounded border px-1.5 py-0.5 font-mono text-[11px] font-semibold ${methodStyles[row.method]}`}
                >
                  {row.method}
                </span>
                <span className="truncate font-mono text-xs text-dim md:text-[13px]">
                  {row.path}
                </span>
                <div className="hidden items-center gap-2 sm:flex">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className={`h-full rounded-full ${active ? "bg-amber-glow" : "bg-dim/70"}`}
                      initial={false}
                      animate={{ width: `${pct}%` }}
                      transition={
                        reduceMotion ? { duration: 0 } : { duration: 0.9, ease: "easeOut" }
                      }
                    />
                  </div>
                  <span
                    className={`w-16 font-mono text-xs tabular-nums ${
                      active ? "text-amber-glow" : "text-fog"
                    }`}
                  >
                    {row.latency}ms
                  </span>
                </div>
                <span className="text-right font-mono text-xs tabular-nums text-faint">
                  {p99}ms
                </span>
              </div>

              {/* Mobile latency bar */}
              <div className="mt-2 flex items-center gap-2 sm:hidden">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className={`h-full rounded-full ${active ? "bg-amber-glow" : "bg-dim/70"}`}
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: "easeOut" }}
                  />
                </div>
                <span
                  className={`font-mono text-xs tabular-nums ${
                    active ? "text-amber-glow" : "text-fog"
                  }`}
                >
                  {row.latency}ms
                </span>
              </div>

              {/* Hover detail strip */}
              {active && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-x-6 gap-y-1 pt-2 font-mono text-[11px] text-faint">
                    <span>
                      p50 <span className="text-dim">{p50}ms</span>
                    </span>
                    <span>
                      p99 <span className="text-dim">{p99}ms</span>
                    </span>
                    <span>
                      throughput <span className="text-dim">{row.rpm} rpm</span>
                    </span>
                    <span>
                      errors <span className="text-ok">0.00%</span>
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-line px-4 py-2">
        <p className="font-mono text-[11px] text-faint">
          illustrative sample traffic · hover a row to inspect
        </p>
      </div>
    </div>
  );
}
