import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/* Abstract living background: a faint network-topology world drawn on a
   single canvas. The world is ~3x the viewport height; scrolling pans
   through it with a gentle parallax lag (0.35x of scrollY), so it feels
   like traveling down through a wide network. Thin hairline wires
   connect soft nodes; small packets travel the wires like requests
   flowing through a system. ~10 major nodes are Jerin's stack hubs
   (java, spring boot, kafka, postgres, redis, docker, kubernetes,
   react, python, aws), each with a small ORIGINAL minimal line-art
   glyph (simple geometric marks drawn here, not brand logos) and a
   tiny quiet mono label. Packets scatter away from the cursor (or a
   touch point), brighten, then settle back.

   Reacts to the playground via `jj:scenario` events: "slow-db" slows
   the packets and tints them amber/red (plus the postgres/redis hubs);
   "flood" spawns more packets; a return to "healthy" sweeps a green
   pulse across the field, then calm.

   Zero long text in this layer, ever. Only tiny hub labels, so the
   background can never congest the headings. Under
   prefers-reduced-motion: one static faint frame, no animation. */

type Mode = "calm" | "slow-db" | "flood" | "recovering";

interface TNode {
  x: number;
  y: number;
  r: number;
  phase: number;
  hub: string | null; // hub name or null for plain dots
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

const HUBS = [
  "java",
  "spring boot",
  "kafka",
  "postgres",
  "redis",
  "docker",
  "kubernetes",
  "react",
  "python",
  "aws",
];

const DATA_HUBS = new Set(["postgres", "redis"]);

/* Original minimal line-art glyphs: simple geometric marks drawn with
   strokes. Not brand logos. Each draws centered at (x, y) within ~s. */
function drawGlyph(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  s: number,
  style: string,
) {
  ctx.strokeStyle = style;
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  switch (name) {
    case "java": {
      // little mug: rounded body + handle
      const w = s * 1.1;
      const h = s * 0.95;
      ctx.roundRect(x - w / 2, y - h / 2, w, h, s * 0.18);
      ctx.moveTo(x + w / 2, y - h * 0.22);
      ctx.arc(x + w / 2 + s * 0.16, y, s * 0.24, -Math.PI / 2.4, Math.PI / 2.4);
      break;
    }
    case "spring boot": {
      // leaf: two arcs + stem
      ctx.moveTo(x - s * 0.5, y + s * 0.45);
      ctx.quadraticCurveTo(x - s * 0.1, y - s * 0.5, x + s * 0.55, y - s * 0.25);
      ctx.quadraticCurveTo(x + s * 0.1, y + s * 0.15, x - s * 0.5, y + s * 0.45);
      ctx.moveTo(x - s * 0.5, y + s * 0.45);
      ctx.lineTo(x - s * 0.72, y + s * 0.72);
      break;
    }
    case "kafka": {
      // zigzag bolt
      ctx.moveTo(x + s * 0.28, y - s * 0.6);
      ctx.lineTo(x - s * 0.28, y + s * 0.02);
      ctx.lineTo(x + s * 0.18, y + s * 0.02);
      ctx.lineTo(x - s * 0.28, y + s * 0.6);
      break;
    }
    case "postgres":
    case "redis": {
      // rings: two concentric circles + center dot
      ctx.arc(x, y, s * 0.55, 0, Math.PI * 2);
      ctx.moveTo(x + s * 0.3, y);
      ctx.arc(x, y, s * 0.3, 0, Math.PI * 2);
      ctx.moveTo(x + s * 0.06, y);
      ctx.arc(x, y, s * 0.06, 0, Math.PI * 2);
      break;
    }
    case "docker": {
      // container: box with dividers
      const w = s * 1.2;
      const h = s * 0.8;
      ctx.rect(x - w / 2, y - h / 2, w, h);
      for (let i = 1; i < 4; i++) {
        const lx = x - w / 2 + (w / 4) * i;
        ctx.moveTo(lx, y - h / 2);
        ctx.lineTo(lx, y + h / 2);
      }
      break;
    }
    case "kubernetes": {
      // wheel: circle + spokes
      ctx.arc(x, y, s * 0.55, 0, Math.PI * 2);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * s * 0.55, y + Math.sin(a) * s * 0.55);
      }
      break;
    }
    case "react": {
      // orbit: one ellipse + nucleus
      ctx.ellipse(x, y, s * 0.62, s * 0.24, -Math.PI / 5, 0, Math.PI * 2);
      ctx.moveTo(x + s * 0.05, y);
      ctx.arc(x, y, s * 0.05, 0, Math.PI * 2);
      break;
    }
    case "python": {
      // two interlocked rounded squares
      const w = s * 0.62;
      ctx.roundRect(x - w - s * 0.06, y - w / 2 - s * 0.08, w, w, s * 0.14);
      ctx.roundRect(x + s * 0.06, y - w / 2 + s * 0.08, w, w, s * 0.14);
      break;
    }
    case "aws": {
      // cloud: three arcs + baseline
      ctx.arc(x - s * 0.3, y + s * 0.05, s * 0.28, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(x - s * 0.02, y - s * 0.18, s * 0.3, Math.PI, Math.PI * 2);
      ctx.arc(x + s * 0.3, y + s * 0.05, s * 0.28, Math.PI * 1.5, Math.PI * 0.5);
      ctx.moveTo(x - s * 0.58, y + s * 0.33);
      ctx.lineTo(x + s * 0.58, y + s * 0.33);
      break;
    }
    case "hex": {
      // hexagon
      for (let i = 0; i <= 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const px = x + Math.cos(a) * s * 0.55;
        const py = y + Math.sin(a) * s * 0.55;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      break;
    }
    case "cube": {
      // isometric cube outline
      const w = s * 0.5;
      const h = s * 0.32;
      ctx.moveTo(x - w, y);
      ctx.lineTo(x, y - h);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.moveTo(x - w, y);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + w, y);
      ctx.moveTo(x, y - h);
      ctx.lineTo(x, y + h);
      break;
    }
    case "gear": {
      // small gear: ring + teeth
      ctx.arc(x, y, s * 0.34, 0, Math.PI * 2);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.moveTo(x + Math.cos(a) * s * 0.34, y + Math.sin(a) * s * 0.34);
        ctx.lineTo(x + Math.cos(a) * s * 0.52, y + Math.sin(a) * s * 0.52);
      }
      break;
    }
    case "waves": {
      // three signal arcs
      for (let i = 1; i <= 3; i++) {
        ctx.moveTo(x - s * 0.5, y + s * (0.35 - i * 0.28));
        ctx.quadraticCurveTo(x, y + s * (0.05 - i * 0.28), x + s * 0.5, y + s * (0.35 - i * 0.28));
      }
      break;
    }
    case "spiral": {
      // loose spiral
      for (let a = 0; a < Math.PI * 3.4; a += 0.25) {
        const r = (a / (Math.PI * 3.4)) * s * 0.55;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      break;
    }
    case "target": {
      // crosshair: circle + ticks
      ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
      ctx.moveTo(x - s * 0.72, y);
      ctx.lineTo(x - s * 0.5, y);
      ctx.moveTo(x + s * 0.5, y);
      ctx.lineTo(x + s * 0.72, y);
      ctx.moveTo(x, y - s * 0.72);
      ctx.lineTo(x, y - s * 0.5);
      ctx.moveTo(x, y + s * 0.5);
      ctx.lineTo(x, y + s * 0.72);
      break;
    }
    case "lock": {
      // padlock: body + shackle
      ctx.rect(x - s * 0.4, y - s * 0.05, s * 0.8, s * 0.55);
      ctx.moveTo(x - s * 0.25, y - s * 0.05);
      ctx.lineTo(x - s * 0.25, y - s * 0.3);
      ctx.arc(x, y - s * 0.3, s * 0.25, Math.PI, 0);
      ctx.lineTo(x + s * 0.25, y - s * 0.05);
      break;
    }
    case "chip": {
      // chip: square + pins
      ctx.rect(x - s * 0.35, y - s * 0.35, s * 0.7, s * 0.7);
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
        ctx.moveTo(x + dx * s * 0.35, y + dy * s * 0.35);
        ctx.lineTo(x + dx * s * 0.58, y + dy * s * 0.58);
      }
      break;
    }
    case "antenna": {
      // broadcast: dot + two arcs
      ctx.moveTo(x + s * 0.06, y + s * 0.1);
      ctx.arc(x, y + s * 0.1, s * 0.06, 0, Math.PI * 2);
      ctx.arc(x, y + s * 0.1, s * 0.32, -Math.PI / 3, -Math.PI / 6 + Math.PI / 2);
      ctx.moveTo(x + s * 0.45 * Math.cos(-Math.PI / 3), y + s * 0.1 + s * 0.45 * Math.sin(-Math.PI / 3));
      ctx.arc(x, y + s * 0.1, s * 0.45, -Math.PI / 3, Math.PI / 3);
      break;
    }
    case "gauge": {
      // dial: arc + needle
      ctx.arc(x, y, s * 0.5, Math.PI * 1.15, Math.PI * 1.85);
      ctx.moveTo(x, y);
      ctx.lineTo(x + s * 0.34, y - s * 0.28);
      break;
    }
    case "layers": {
      // stacked diamonds
      for (let i = 0; i < 3; i++) {
        const yy = y - s * 0.25 + i * s * 0.25;
        ctx.moveTo(x - s * 0.5, yy);
        ctx.lineTo(x, yy - s * 0.22);
        ctx.lineTo(x + s * 0.5, yy);
      }
      break;
    }
    case "diamond": {
      ctx.moveTo(x, y - s * 0.55);
      ctx.lineTo(x + s * 0.4, y);
      ctx.lineTo(x, y + s * 0.55);
      ctx.lineTo(x - s * 0.4, y);
      ctx.closePath();
      break;
    }
    case "tri": {
      for (let i = 0; i <= 3; i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const px = x + Math.cos(a) * s * 0.55;
        const py = y + Math.sin(a) * s * 0.55;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      break;
    }
    case "spark": {
      // four-point star
      ctx.moveTo(x, y - s * 0.55);
      ctx.quadraticCurveTo(x, y, x + s * 0.55, y);
      ctx.quadraticCurveTo(x, y, x, y + s * 0.55);
      ctx.quadraticCurveTo(x, y, x - s * 0.55, y);
      ctx.quadraticCurveTo(x, y, x, y - s * 0.55);
      break;
    }
    case "grid": {
      // 2x2 grid
      ctx.rect(x - s * 0.5, y - s * 0.5, s, s);
      ctx.moveTo(x, y - s * 0.5);
      ctx.lineTo(x, y + s * 0.5);
      ctx.moveTo(x - s * 0.5, y);
      ctx.lineTo(x + s * 0.5, y);
      break;
    }
    default: {
      ctx.arc(x, y, s * 0.4, 0, Math.PI * 2);
    }
  }
  ctx.stroke();
}

const WORLD_MUL = 3; // world height = 3x viewport height

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
    let worldH = H * WORLD_MUL;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let nodes: TNode[] = [];
    let adj: number[][] = [];
    let packets: Packet[] = [];
    const cursor = { x: -9999, y: -9999, t: -9999 }; // world coords
    const modeRef: { mode: Mode } = { mode: "calm" };
    let pulseStart = -1; // seconds; green sweep on recovery
    let accent = "#e8491d";
    let frame = 0;
    let camY = 0; // eased camera
    let camTarget = 0;

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
      worldH = H * WORLD_MUL;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      canvas!.style.width = `${W}px`;
      canvas!.style.height = `${H}px`;

      const mobile = W < 640;
      const rnd = mulberry(Math.round(W * 31 + H * 17));
      const cell = mobile ? 150 : 270;
      const cols = Math.max(4, Math.round(W / cell));
      const rows = Math.max(6, Math.round(worldH / cell));
      const cap = mobile ? 40 : 52;
      nodes = [];
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          if (nodes.length >= cap) break;
          nodes.push({
            x: ((cx + 0.5 + (rnd() - 0.5) * 0.7) / cols) * W,
            y: ((cy + 0.5 + (rnd() - 0.5) * 0.7) / rows) * worldH,
            r: 1.6 + rnd() * 1.6,
            phase: rnd() * Math.PI * 2,
            hub: null,
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
      // pick ~10 hubs spread through the world height
      const order = [...HUBS];
      for (let i = order.length - 1; i > 0; i--) {
        const k = Math.floor(rnd() * (i + 1));
        [order[i], order[k]] = [order[k], order[i]];
      }
      const picked: number[] = [];
      const minGap = worldH / (order.length + 2);
      const byY = nodes.map((_, i) => i).sort((a, b) => nodes[a].y - nodes[b].y);
      for (const i of byY) {
        if (picked.length >= order.length) break;
        if (picked.every((p) => Math.abs(nodes[p].y - nodes[i].y) > minGap * 0.6)) {
          picked.push(i);
        }
      }
      picked.forEach((idx, k) => {
        nodes[idx].hub = order[k % order.length];
        nodes[idx].r = 7;
      });
      // every node gets an icon: hubs use the stack glyph, the rest get a
      // decorative geometric mark so icons run through the whole network
      const GENERIC = ["hex", "cube", "gear", "waves", "spiral", "target", "lock", "chip", "antenna", "gauge", "layers", "diamond", "tri", "spark", "grid"];
      nodes.forEach((n, i) => {
        if (!n.hub) n.hub = GENERIC[i % GENERIC.length];
      });
      // keep packets on valid edges
      packets = packets.filter((p) => p.from < nodes.length && p.to < nodes.length);
      camTarget = parallaxCam();
      camY = camTarget;
      spawnToTarget(true);
    }

    function clampCam(v: number): number {
      return Math.min(Math.max(v, 0), Math.max(0, worldH - H));
    }

    // adaptive parallax: camera always traverses the full world exactly
    // across the full page scroll, so the network never stalls early
    function parallaxCam(): number {
      const scrollMax = Math.max(1, document.documentElement.scrollHeight - H);
      const factor = (worldH - H) / scrollMax;
      return clampCam(window.scrollY * factor);
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

    // edge fade: ease items in/out near the viewport band (world coords)
    function edgeFade(y: number): number {
      const sy = y - camY;
      const m = 140;
      const a = Math.min(1, Math.max(0, (sy + m) / m));
      const b = Math.min(1, Math.max(0, (H + m - sy) / m));
      return Math.min(a, b);
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
          const f = Math.min(edgeFade(a.y), edgeFade(b.y));
          if (f <= 0) continue;
          ctx!.strokeStyle = `rgba(${INK},${(0.13 * f).toFixed(3)})`;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }
    }

    function drawNodes() {
      const sick = modeRef.mode === "slow-db";
      for (const n of nodes) {
        const f = edgeFade(n.y);
        if (f <= 0) continue;
        // every node: faint ring + icon, no labels
        const ringColor =
          sick && DATA_HUBS.has(n.hub!) ? `rgba(${RED},${(0.4 * f).toFixed(3)})` : `rgba(${INK},${(0.18 * f).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 8, 0, Math.PI * 2);
        ctx!.strokeStyle = ringColor;
        ctx!.lineWidth = 1;
        ctx!.stroke();
        drawGlyph(
          ctx!,
          n.hub!,
          n.x,
          n.y,
          6.5,
          `rgba(${INK},${(0.32 * f).toFixed(3)})`,
        );
      }
    }

    function drawPulse() {
      if (pulseStart < 0) return;
      const now = performance.now() / 1000;
      const age = now - pulseStart;
      if (age > 1.8) {
        pulseStart = -1;
        return;
      }
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const x = (age / 1.8) * (W + 240) - 120;
      const fade = 1 - age / 1.8;
      const grad = ctx!.createLinearGradient(x - 120, 0, x + 120, 0);
      grad.addColorStop(0, `rgba(${GREEN},0)`);
      grad.addColorStop(0.5, `rgba(${GREEN},${0.1 * fade})`);
      grad.addColorStop(1, `rgba(${GREEN},0)`);
      ctx!.fillStyle = grad;
      ctx!.fillRect(x - 120, 0, 240, H);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, -camY * dpr);
    }

    function drawPackets(now: number, dt: number) {
      const cur = cursor;
      const cursorLive = now - cur.t < 2.5;
      const mul = speedMul();
      const target = targetCount();
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
        p.t += (p.speed * mul * dt) / len;
        if (p.t >= 1) {
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
        const f = edgeFade(y);
        if (f <= 0) continue;

        let tx = 0;
        let ty = 0;
        let tb = 0;
        if (cursorLive) {
          const vx = x - cur.x;
          const vy = y - cur.y;
          const d = Math.hypot(vx, vy);
          const R = 150;
          if (d < R && d > 1) {
            const k = 1 - d / R;
            tx = (vx / d) * k * 60;
            ty = (vy / d) * k * 60;
            tb = k;
          }
        }
        p.ox += (tx - p.ox) * 0.14;
        p.oy += (ty - p.oy) * 0.14;
        p.bright += (tb - p.bright) * 0.14;

        const px = x + p.ox;
        const py = y + p.oy;
        let color: string = INK;
        if (modeRef.mode === "slow-db" && p.warn) color = p.accent ? RED : AMBER;
        const alpha = Math.min(1, 0.32 + p.bright * 0.45) * f;
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

    function drawStatic() {
      ctx!.setTransform(dpr, 0, 0, dpr, 0, -camY * dpr);
      drawWires();
      drawNodes();
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
        const f = edgeFade(y);
        if (f <= 0) continue;
        ctx!.beginPath();
        ctx!.arc(x, y, 2, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${INK},${(0.3 * f).toFixed(3)})`;
        ctx!.fill();
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
      // eased parallax camera toward scroll position
      camTarget = parallaxCam();
      camY += (camTarget - camY) * 0.08;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, -camY * dpr);
      ctx!.clearRect(0, camY, W, H);
      drawWires();
      drawNodes();
      drawPulse();
      drawPackets(now, dt);
    };

    const onPoint = (e: PointerEvent) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY + camY; // world coords
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
      window.addEventListener("resize", onResize);
    } else {
      window.addEventListener("pointermove", onPoint, { passive: true });
      window.addEventListener("pointerdown", onPoint, { passive: true });
      window.addEventListener("jj:scenario", onScenario);
      window.addEventListener("resize", onResize);
      raf = requestAnimationFrame(tick);
    }

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
