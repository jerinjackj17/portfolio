import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/* Abstract living background: a faint network-topology field drawn on a
   single canvas. Thin hairline wires connect soft nodes; small packets
   travel the wires like requests flowing through a system. Packets scatter
   away from the cursor (or a touch point), brighten, then settle back.

   Reacts to the playground via `jj:scenario` events: "slow-db" slows the
   packets and tints them amber/red; "flood" spawns more packets; a return
   to "healthy" sweeps a green pulse across the field, then calm.

   Zero text in this layer, ever — letterforms live only in the foreground,
   so the background can never congest the headings. Under
   prefers-reduced-motion: one static faint frame, no animation. */

type Mode = "calm" | "slow-db" | "flood" | "recovering";

interface TNode {
  x: number;
  y: number;
  r: number;
  phase: number;
}
interface Packet {
  from: number;
  to: number;
  t: number; // 0..1 along the edge
  speed: number; // px per second (base)
  accent: boolean;
  warn: boolean; // tinted amber/red during slow-db
  ox: number;
  oy: number;
  bright: number; // eased 0..1 cursor brightness
}

// Deterministic RNG so the topology is stable per viewport size.
function mulberry(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let z = Math.imul(s ^ (s >>> 15), 1 | s);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

const INK = "26,24,21"; // --color-ink
const AMBER = "150,92,24";
const RED = "178,58,32";
const GREEN = "46,125,50";

export default function SystemLogBackground() {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = reduceMotion === true;
    let W = window.innerWidth;
    let H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let nodes: TNode[] = [];
    let adj: number[][] = [];
    let packets: Packet[] = [];
    const cursor = { x: -9999, y: -9999, t: -9999 };
    const modeRef: { mode: Mode } = { mode: "calm" };
    let pulseStart = -1; // seconds; green sweep on recovery
    let accent = "#e8491d";
    let frame = 0;

    const readAccent = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim();
      if (v) accent = v;
    };
    readAccent();

    function build() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      canvas!.style.width = `${W}px`;
      canvas!.style.height = `${H}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mobile = W < 640;
      const rnd = mulberry(Math.round(W * 31 + H * 17));
      const cols = Math.max(4, Math.round(W / (mobile ? 150 : 270)));
      const rows = Math.max(3, Math.round(H / (mobile ? 170 : 270)));
      nodes = [];
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          if (nodes.length >= 30) break;
          nodes.push({
            x: ((cx + 0.5 + (rnd() - 0.5) * 0.7) / cols) * W,
            y: ((cy + 0.5 + (rnd() - 0.5) * 0.7) / rows) * H,
            r: 1.6 + rnd() * 1.6,
            phase: rnd() * Math.PI * 2,
          });
        }
      }
      // connect each node to its 2 nearest neighbors
      adj = nodes.map(() => []);
      const seen = new Set<string>();
      nodes.forEach((n, i) => {
        const dists = nodes
          .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
          .filter((o) => o.j !== i)
          .sort((a, b) => a.d - b.d)
          .slice(0, 2);
        for (const { j } of dists) {
          const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
          if (!seen.has(key)) {
            seen.add(key);
            adj[i].push(j);
            adj[j].push(i);
          }
        }
      });
      // keep packets on valid edges
      packets = packets.filter((p) => p.from < nodes.length && p.to < nodes.length);
      spawnToTarget(true);
    }

    function randomEdge(rnd: () => number): [number, number] | null {
      const candidates = nodes
        .map((_, i) => i)
        .filter((i) => adj[i].length > 0);
      if (!candidates.length) return null;
      const from = candidates[Math.floor(rnd() * candidates.length)];
      const to = adj[from][Math.floor(rnd() * adj[from].length)];
      return [from, to];
    }

    function makePacket(rnd: () => number): Packet | null {
      const e = randomEdge(rnd);
      if (!e) return null;
      return {
        from: e[0],
        to: e[1],
        t: rnd(),
        speed: 34 + rnd() * 52,
        accent: rnd() < 0.16,
        warn: rnd() < 0.45,
        ox: 0,
        oy: 0,
        bright: 0,
      };
    }

    function targetCount(): number {
      const mobile = W < 640;
      const base = Math.max(6, Math.min(mobile ? 8 : 14, Math.round(nodes.length / 2)));
      if (modeRef.mode === "flood") return Math.min(30, Math.round(base * 2.2));
      return base;
    }

    let spawnClock = 0;
    function spawnToTarget(instant: boolean) {
      const target = targetCount();
      if (packets.length > target) packets = packets.slice(0, target);
      if (!instant) return;
      const rnd = mulberry((Date.now() % 2147483647) || 1);
      while (packets.length < target) {
        const p = makePacket(rnd);
        if (!p) break;
        packets.push(p);
      }
    }

    function speedMul(): number {
      if (modeRef.mode === "slow-db") return 0.35;
      if (modeRef.mode === "flood") return 1.25;
      return 1;
    }

    function drawStatic() {
      ctx!.clearRect(0, 0, W, H);
      drawWires();
      drawNodes(0);
      const rnd = mulberry(1234);
      const n = Math.min(8, Math.max(4, Math.round(nodes.length / 3)));
      for (let i = 0; i < n; i++) {
        const e = randomEdge(rnd);
        if (!e) continue;
        const a = nodes[e[0]];
        const b = nodes[e[1]];
        const t = rnd();
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        ctx!.beginPath();
        ctx!.arc(x, y, 2, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${INK},0.3)`;
        ctx!.fill();
      }
    }

    function drawWires() {
      ctx!.lineWidth = 1;
      const drawn = new Set<string>();
      for (let i = 0; i < nodes.length; i++) {
        for (const j of adj[i]) {
          const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
          if (drawn.has(key)) continue;
          drawn.add(key);
          const a = nodes[i];
          const b = nodes[j];
          ctx!.strokeStyle = `rgba(${INK},0.13)`;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }
    }

    function drawNodes(now: number) {
      for (const n of nodes) {
        const pulse = 1 + Math.sin(now * 0.9 + n.phase) * 0.18;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${INK},0.22)`;
        ctx!.fill();
      }
    }

    function drawPulse(now: number) {
      if (pulseStart < 0) return;
      const age = now - pulseStart;
      if (age > 1.8) {
        pulseStart = -1;
        return;
      }
      const x = (age / 1.8) * (W + 240) - 120;
      const fade = 1 - age / 1.8;
      const grad = ctx!.createLinearGradient(x - 120, 0, x + 120, 0);
      grad.addColorStop(0, `rgba(${GREEN},0)`);
      grad.addColorStop(0.5, `rgba(${GREEN},${0.1 * fade})`);
      grad.addColorStop(1, `rgba(${GREEN},0)`);
      ctx!.fillStyle = grad;
      ctx!.fillRect(x - 120, 0, 240, H);
    }

    function drawPackets(now: number, dt: number) {
      const cur = cursor;
      const cursorLive = now - cur.t < 2.5;
      const mul = speedMul();
      const target = targetCount();
      // ease packet population toward the target
      spawnClock += dt;
      if (packets.length < target && spawnClock > 0.35) {
        spawnClock = 0;
        const p = makePacket(mulberry((Date.now() + packets.length * 7919) % 2147483647));
        if (p) packets.push(p);
      } else if (packets.length > target + 4) {
        packets.pop();
      }

      for (const p of packets) {
        const a = nodes[p.from];
        const b = nodes[p.to];
        if (!a || !b) continue;
        const len = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
        p.t += ((p.speed * mul * dt) / len);
        if (p.t >= 1) {
          // arrive: continue from the arrival node
          const opts = adj[p.to].filter((j) => j !== p.from);
          const next = opts.length
            ? opts[Math.floor(Math.random() * opts.length)]
            : adj[p.to][0];
          if (next === undefined) {
            p.t = 0;
            continue;
          }
          p.from = p.to;
          p.to = next;
          p.t = 0;
        }
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;

        // cursor scatter: push away + brighten, ease back when it leaves
        let tx = 0;
        let ty = 0;
        let tb = 0;
        if (cursorLive) {
          const vx = x - cur.x;
          const vy = y - cur.y;
          const d = Math.hypot(vx, vy);
          const R = 150;
          if (d < R && d > 1) {
            const f = 1 - d / R;
            tx = (vx / d) * f * 60;
            ty = (vy / d) * f * 60;
            tb = f;
          }
        }
        p.ox += (tx - p.ox) * 0.14;
        p.oy += (ty - p.oy) * 0.14;
        p.bright += (tb - p.bright) * 0.14;

        const px = x + p.ox;
        const py = y + p.oy;
        let color: string = INK;
        if (modeRef.mode === "slow-db" && p.warn) color = p.accent ? RED : AMBER;
        const alpha = Math.min(1, 0.32 + p.bright * 0.45);
        ctx!.beginPath();
        ctx!.arc(px, py, 2 + p.bright * 1.6, 0, Math.PI * 2);
        if (p.accent && modeRef.mode !== "slow-db") {
          ctx!.fillStyle = accent;
          ctx!.globalAlpha = alpha;
        } else {
          ctx!.fillStyle = `rgba(${color},${alpha.toFixed(3)})`;
          ctx!.globalAlpha = 1;
        }
        ctx!.fill();
        ctx!.globalAlpha = 1;
      }
    }

    let raf = 0;
    let last = performance.now() / 1000;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) {
        last = performance.now() / 1000;
        return;
      }
      const now = performance.now() / 1000;
      const dt = Math.min(0.05, now - last);
      last = now;
      frame++;
      if (frame % 120 === 0) readAccent();
      ctx!.clearRect(0, 0, W, H);
      drawWires();
      drawNodes(now);
      drawPulse(now);
      drawPackets(now, dt);
    };

    const onPoint = (e: PointerEvent) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
      cursor.t = performance.now() / 1000;
    };

    const onScenario = (e: Event) => {
      const sc = (e as CustomEvent<{ scenario?: string }>).detail?.scenario;
      if (sc === "slow-db" || sc === "flood") {
        modeRef.mode = sc;
      } else if (sc === "healthy") {
        if (modeRef.mode === "slow-db" || modeRef.mode === "flood") {
          modeRef.mode = "recovering";
          pulseStart = performance.now() / 1000;
          window.setTimeout(() => {
            if (modeRef.mode === "recovering") modeRef.mode = "calm";
          }, 2200);
        }
      }
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 250);
    };

    build();
    if (reduced) {
      drawStatic();
    } else {
      window.addEventListener("pointermove", onPoint, { passive: true });
      window.addEventListener("pointerdown", onPoint, { passive: true });
      window.addEventListener("jj:scenario", onScenario);
      raf = requestAnimationFrame(tick);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", onPoint);
      window.removeEventListener("pointerdown", onPoint);
      window.removeEventListener("jj:scenario", onScenario);
      window.removeEventListener("resize", onResize);
    };
  }, [reduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden"
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
