import { useEffect, useReducer, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { systemNodes } from "../data";

/* ================= geometry: flat schematic, hairline roads ================= */

interface NodeGeom {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const GEOM: NodeGeom[] = [
  { id: "client", x: 24, y: 277, w: 132, h: 66 },
  { id: "api-gateway", x: 236, y: 277, w: 150, h: 66 },
  { id: "auth-svc", x: 466, y: 67, w: 150, h: 66 },
  { id: "payments-svc", x: 466, y: 277, w: 150, h: 66 },
  { id: "reports-svc", x: 466, y: 487, w: 150, h: 66 },
  { id: "kafka", x: 696, y: 277, w: 150, h: 66 },
  { id: "postgres", x: 886, y: 67, w: 140, h: 66 },
  { id: "redis", x: 886, y: 277, w: 140, h: 66 },
  { id: "mongo", x: 886, y: 487, w: 140, h: 66 },
];

interface Road {
  id: string;
  d: string;
  from: string;
  to: string;
  kind: "car" | "bike";
}

const ROADS: Road[] = [
  { id: "r-client-gw", d: "M 156 310 H 236", from: "client", to: "api-gateway", kind: "car" },
  { id: "r-gw-auth", d: "M 386 310 H 411 V 100 H 466", from: "api-gateway", to: "auth-svc", kind: "car" },
  { id: "r-gw-pay", d: "M 386 310 H 466", from: "api-gateway", to: "payments-svc", kind: "car" },
  { id: "r-gw-rep", d: "M 386 310 H 411 V 520 H 466", from: "api-gateway", to: "reports-svc", kind: "car" },
  { id: "r-auth-kafka", d: "M 616 100 H 641 V 310 H 696", from: "auth-svc", to: "kafka", kind: "bike" },
  { id: "r-pay-kafka", d: "M 616 310 H 696", from: "payments-svc", to: "kafka", kind: "bike" },
  { id: "r-rep-kafka", d: "M 616 520 H 641 V 310 H 696", from: "reports-svc", to: "kafka", kind: "bike" },
  { id: "r-kafka-pg", d: "M 846 310 H 871 V 100 H 886", from: "kafka", to: "postgres", kind: "bike" },
  { id: "r-kafka-redis", d: "M 846 310 H 886", from: "kafka", to: "redis", kind: "bike" },
  { id: "r-kafka-mongo", d: "M 846 310 H 871 V 520 H 886", from: "kafka", to: "mongo", kind: "bike" },
];

const ROAD_BY_ID: Record<string, Road> = Object.fromEntries(
  ROADS.map((r) => [r.id, r]),
);

const COLS: [string, number][] = [
  ["edge", 205],
  ["services", 541],
  ["streaming", 771],
  ["storage", 956],
];

/* A light isometric nod: each node gets a thin top face, flat ink on paper.
   Roads stay orthogonal so the vehicles read at a glance. */
const ISO_D = 7;

const HEAT_HEX = ["#FAF9F7", "#F4EDE1", "#F2C29B", "#E8491D"];
const DEAD_FILL = "#E9E2D3";

/* ================= simulation state ================= */

type Scenario = "healthy" | "slow-query" | "spike" | "killed";
type DeployPhase = "building" | "rolling" | "done";

interface Vehicle {
  id: number;
  road: string;
  t: number;
  pxPerSec: number;
  kind: "car" | "bike";
  label: string | null;
  stopped: boolean;
}

interface NodeSim {
  rpm: number;
  p50: number;
  heat: 0 | 1 | 2 | 3;
  down: boolean;
}

interface SimState {
  traffic: number;
  scenario: Scenario;
  deploy: DeployPhase | null;
  spikeLeft: number;
  flash: string | null;
  nodes: Record<string, NodeSim>;
  vehicles: Vehicle[];
  spawnIn: Record<string, number>;
  selected: string | null;
  nextId: number;
}

type Action =
  | { type: "TICK"; frozen: boolean; lengths: Record<string, number> }
  | { type: "SET_TRAFFIC"; value: number }
  | { type: "INJECT_SLOW_QUERY" }
  | { type: "TRAFFIC_SPIKE" }
  | { type: "KILL_PAYMENTS" }
  | { type: "DEPLOY_START" }
  | { type: "DEPLOY_PHASE"; phase: DeployPhase }
  | { type: "RESOLVE" }
  | { type: "CLEAR_FLASH" }
  | { type: "SELECT"; id: string }
  | { type: "CLEAR_SELECT" };

const TICK_S = 0.2;
const QUEUE_PX = 30;
const MAX_VEHICLES = 46;

function initState(): SimState {
  const nodes: Record<string, NodeSim> = {};
  for (const n of systemNodes)
    nodes[n.id] = { rpm: n.baseRpm, p50: n.baseP50, heat: 0, down: false };
  const spawnIn: Record<string, number> = {};
  for (const r of ROADS) spawnIn[r.id] = 2 + Math.floor(Math.random() * 4);
  return {
    traffic: 3,
    scenario: "healthy",
    deploy: null,
    spikeLeft: 0,
    flash: null,
    nodes,
    vehicles: [
      { id: 1, road: "r-client-gw", t: 0.35, pxPerSec: 58, kind: "car", label: null, stopped: false },
      { id: 2, road: "r-gw-pay", t: 0.55, pxPerSec: 52, kind: "car", label: "GET /payments", stopped: false },
      { id: 3, road: "r-pay-kafka", t: 0.4, pxPerSec: 60, kind: "bike", label: "event: audit", stopped: false },
      { id: 4, road: "r-kafka-redis", t: 0.65, pxPerSec: 56, kind: "bike", label: null, stopped: false },
      { id: 5, road: "r-gw-auth", t: 0.25, pxPerSec: 50, kind: "car", label: null, stopped: false },
      { id: 6, road: "r-kafka-pg", t: 0.3, pxPerSec: 62, kind: "bike", label: null, stopped: false },
    ],
    spawnIn,
    selected: "api-gateway",
    nextId: 100,
  };
}

function spawnInterval(kind: "car" | "bike", traffic: number): number {
  const base = kind === "car" ? 13 : 10;
  return Math.max(2, Math.round(base / traffic));
}

function labelFor(roadId: string, id: number): string | null {
  if (roadId === "r-gw-pay" && id % 7 === 2) return "GET /payments";
  if (roadId === "r-pay-kafka" && id % 7 === 4) return "event: audit";
  if (roadId === "r-client-gw" && id % 9 === 1) return "GET /health";
  return null;
}

function reducer(state: SimState, action: Action): SimState {
  switch (action.type) {
    case "SET_TRAFFIC":
      return { ...state, traffic: action.value };
    case "INJECT_SLOW_QUERY":
      if (state.scenario !== "healthy") return state;
      return { ...state, scenario: "slow-query" };
    case "TRAFFIC_SPIKE":
      if (state.scenario !== "healthy") return state;
      return { ...state, scenario: "spike", spikeLeft: 100 };
    case "KILL_PAYMENTS": {
      if (state.scenario !== "healthy") return state;
      const node = state.nodes["payments-svc"];
      const nodes = {
        ...state.nodes,
        "payments-svc": { ...node, down: true, rpm: 0 },
      };
      return { ...state, scenario: "killed", nodes };
    }
    case "DEPLOY_START":
      return { ...state, deploy: "building" };
    case "DEPLOY_PHASE":
      return { ...state, deploy: action.phase };
    case "RESOLVE": {
      const nodes: Record<string, NodeSim> = {};
      for (const sn of systemNodes)
        nodes[sn.id] = { ...state.nodes[sn.id], down: false };
      return {
        ...state,
        scenario: "healthy",
        deploy: null,
        spikeLeft: 0,
        flash: "resolved · p99 nominal",
        nodes,
      };
    }
    case "CLEAR_FLASH":
      return { ...state, flash: null };
    case "SELECT":
      return { ...state, selected: action.id };
    case "CLEAR_SELECT":
      return { ...state, selected: null };
    case "TICK": {
      const effTraffic = state.scenario === "spike" ? 10 : state.traffic;
      const lengths = action.lengths;

      // 1. advance vehicles along their roads
      let vehicles: Vehicle[] = state.vehicles.map((v) => {
        if (action.frozen || v.stopped) return v;
        const len = lengths[v.road] ?? 200;
        return { ...v, t: v.t + (v.pxPerSec * TICK_S) / len };
      });

      // 2. queue bumper-to-bumper before a congested node
      const congestedTo = state.scenario === "slow-query" ? "reports-svc" : null;
      if (congestedTo) {
        const stoppedCount: Record<string, number> = {};
        for (const v of vehicles)
          if (v.stopped) stoppedCount[v.road] = (stoppedCount[v.road] ?? 0) + 1;
        vehicles = vehicles.map((v) => {
          const road = ROAD_BY_ID[v.road];
          if (road.to !== congestedTo)
            return v.stopped ? { ...v, stopped: false } : v;
          if (v.stopped) return v;
          const len = lengths[v.road] ?? 200;
          const slot = 1 - ((stoppedCount[v.road] ?? 0) * QUEUE_PX + 14) / len;
          if (v.t >= slot) {
            stoppedCount[v.road] = (stoppedCount[v.road] ?? 0) + 1;
            return { ...v, stopped: true, t: Math.min(v.t, Math.max(0, slot)) };
          }
          return v;
        });
      } else if (vehicles.some((v) => v.stopped)) {
        vehicles = vehicles.map((v) => (v.stopped ? { ...v, stopped: false } : v));
      }

      // 3. arrivals leave the system
      vehicles = vehicles.filter((v) => v.t < 1);

      // 4. spawn new traffic (quiet roads when a node is down;
      //    frozen entirely under reduced motion: the scene stays parked)
      const spawnIn = { ...state.spawnIn };
      const fresh: Vehicle[] = [];
      if (!action.frozen) {
        for (const road of ROADS) {
          const left = (spawnIn[road.id] ?? 3) - 1;
          const fromDown = state.nodes[road.from]?.down ?? false;
          const toDown = state.nodes[road.to]?.down ?? false;
          if (
            left <= 0 &&
            !fromDown &&
            !toDown &&
            vehicles.length + fresh.length < MAX_VEHICLES
          ) {
            const id = state.nextId + fresh.length;
            fresh.push({
              id,
              road: road.id,
              t: 0,
              pxPerSec: 46 + Math.random() * 26,
              kind: road.kind,
              label: labelFor(road.id, id),
              stopped: false,
            });
            spawnIn[road.id] = spawnInterval(road.kind, effTraffic);
          } else {
            spawnIn[road.id] = left <= 0 ? 3 : left;
          }
        }
      }

      // 5. metrics random-walk toward scenario targets
      const nodes: Record<string, NodeSim> = {};
      for (const sn of systemNodes) {
        const n = { ...state.nodes[sn.id] };
        if (!n.down) {
          let p50Target = sn.baseP50;
          let heatTarget: 0 | 1 | 2 | 3 = 0;
          if (state.scenario === "slow-query" && sn.id === "reports-svc") {
            p50Target = 2400;
            heatTarget = 3;
          } else if (state.scenario === "spike") {
            p50Target = sn.baseP50 * 2.4;
            heatTarget = sn.id === "kafka" ? 3 : 2;
          } else if (state.scenario === "killed" && sn.id === "api-gateway") {
            heatTarget = 1;
          }
          if (state.deploy === "rolling" || state.deploy === "done") {
            p50Target = sn.baseP50;
            heatTarget = 0;
          }
          n.p50 += (p50Target - n.p50) * 0.3;
          if (n.heat < heatTarget) n.heat = (n.heat + 1) as 0 | 1 | 2 | 3;
          else if (n.heat > heatTarget) n.heat = (n.heat - 1) as 0 | 1 | 2 | 3;
          const rpmTarget = sn.baseRpm * (0.6 + 0.4 * effTraffic);
          n.rpm += (rpmTarget - n.rpm) * 0.2 + n.rpm * (Math.random() - 0.5) * 0.05;
          if (n.rpm < 0) n.rpm = 0;
        } else {
          n.rpm = 0;
        }
        nodes[sn.id] = n;
      }

      // 6. spike burns out on its own
      let scenario = state.scenario;
      let spikeLeft = state.spikeLeft;
      if (scenario === "spike") {
        spikeLeft -= 1;
        if (spikeLeft <= 0) scenario = "healthy";
      }

      return {
        ...state,
        scenario,
        spikeLeft,
        vehicles: [...vehicles, ...fresh],
        spawnIn,
        nodes,
        nextId: state.nextId + fresh.length,
      };
    }
  }
}

function fmtRpm(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${Math.round(n)}`;
}

function statusFor(state: SimState): { text: string; warn: boolean } {
  if (state.flash) return { text: state.flash, warn: false };
  if (state.deploy === "building") return { text: "deploying fix · building…", warn: false };
  if (state.deploy === "rolling") return { text: "deploying fix · rolling out…", warn: false };
  if (state.deploy === "done") return { text: "deploying fix · healthy", warn: false };
  switch (state.scenario) {
    case "slow-query":
      return { text: "! reports-svc p99 breaching SLO · 2.4s", warn: true };
    case "spike":
      return { text: "! traffic spike · 10x load, kafka lag growing", warn: true };
    case "killed":
      return { text: "payments-svc unreachable · failing fast", warn: true };
    default:
      return { text: "all systems nominal", warn: false };
  }
}

/* ================= line-art vehicles ================= */

function CarArt() {
  return (
    <g
      stroke="#1A1815"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#FAF9F7"
    >
      <path d="M-11 3 L-11 -2 L-5 -2 L-2 -6 L6 -6 L9 -2 L11 -2 L11 3 Z" />
      <circle cx={-5.5} cy={4.5} r={2.1} />
      <circle cx={5.5} cy={4.5} r={2.1} />
    </g>
  );
}

function BikeArt() {
  return (
    <g
      stroke="#1A1815"
      strokeWidth={1.5}
      strokeLinecap="round"
      fill="none"
    >
      <circle cx={-7} cy={4} r={2.6} />
      <circle cx={7} cy={4} r={2.6} />
      <path d="M-7 4 L-3 -2.5 H3 M-3 -2.5 L-5 -5.5 M3 -2.5 L5 -5.5 M-7 4 H7" />
    </g>
  );
}

function HandArrowDown() {
  return (
    <svg
      width="64"
      height="72"
      viewBox="0 0 64 72"
      fill="none"
      aria-hidden="true"
      className="text-flame"
    >
      <path
        d="M10 6 C 22 20, 36 34, 50 52 M 50 52 l -12 -2 M 50 52 l -4 -12"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

interface Pt {
  x: number;
  y: number;
}

function VehicleGlyph({
  v,
  samples,
}: {
  v: Vehicle;
  samples: Record<string, Pt[]>;
}) {
  const pts = samples[v.road];
  if (!pts || pts.length < 2) return null;
  const f = Math.min(0.999, Math.max(0, v.t)) * (pts.length - 1);
  const i = Math.floor(f);
  const a = pts[i];
  const b = pts[Math.min(pts.length - 1, i + 1)];
  const frac = f - i;
  const x = a.x + (b.x - a.x) * frac;
  const y = a.y + (b.y - a.y) * frac;
  const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})`}>
      {v.kind === "car" ? <CarArt /> : <BikeArt />}
      {v.label ? (
        <text
          y={-12}
          textAnchor="middle"
          fontSize={8.5}
          fill="#1A1815"
          className="font-mono"
        >
          {v.label}
        </text>
      ) : null}
    </g>
  );
}

function SysNode({
  geom,
  sim,
  selected,
  scenario,
  onSelect,
}: {
  geom: NodeGeom;
  sim: NodeSim;
  selected: boolean;
  scenario: Scenario;
  onSelect: () => void;
}) {
  const node = systemNodes.find((n) => n.id === geom.id);
  if (!node) return null;
  const fill = sim.down ? DEAD_FILL : HEAT_HEX[sim.heat];
  const ink = sim.down ? "#6B6560" : sim.heat === 3 ? "#FAF9F7" : "#1A1815";
  const cx = geom.x + geom.w / 2;
  const showP99 = scenario === "slow-query" && geom.id === "reports-svc";
  const readout = sim.down
    ? "down"
    : node.baseP50 === 0
      ? `${fmtRpm(sim.rpm)} rpm`
      : showP99
        ? `${fmtRpm(sim.rpm)} rpm · ! p99 ${Math.round(sim.p50)}ms`
        : `${fmtRpm(sim.rpm)} rpm · p50 ${Math.round(sim.p50)}ms`;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${node.label}. ${node.role} ${readout}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="cursor-pointer"
    >
      {/* light isometric top face */}
      <polygon
        points={`${geom.x + ISO_D},${geom.y - ISO_D} ${geom.x + geom.w + ISO_D},${geom.y - ISO_D} ${geom.x + geom.w},${geom.y} ${geom.x},${geom.y}`}
        fill="#FAF9F7"
        stroke="#1A1815"
        strokeWidth={1.25}
        strokeDasharray={sim.down ? "4 3" : undefined}
      />
      <rect
        x={geom.x}
        y={geom.y}
        width={geom.w}
        height={geom.h}
        fill={fill}
        stroke="#1A1815"
        strokeWidth={1.5}
        strokeDasharray={sim.down ? "5 4" : undefined}
      />
      {selected && (
        <rect
          x={geom.x}
          y={geom.y + geom.h + 5}
          width={geom.w}
          height={2.5}
          fill="#E8491D"
        />
      )}
      <text
        x={cx}
        y={geom.y + 24}
        textAnchor="middle"
        fontSize={11}
        fill={ink}
        className="font-mono"
        style={{ letterSpacing: "0.1em" }}
      >
        {node.label.toUpperCase()}
      </text>
      <text
        x={cx}
        y={geom.y + 44}
        textAnchor="middle"
        fontSize={10}
        fill={ink}
        opacity={0.8}
        className="font-mono tnum"
      >
        {readout}
      </text>
      {scenario === "spike" && geom.id === "kafka" && !sim.down && (
        <text
          x={cx}
          y={geom.y + 58}
          textAnchor="middle"
          fontSize={9}
          fill="#B23A12"
          className="font-mono"
        >
          lag growing
        </text>
      )}
    </g>
  );
}

function CtlButton({
  disabled,
  onClick,
  children,
}: {
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="border border-ink/70 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ink"
    >
      {children}
    </button>
  );
}

/* ================= the playground ================= */

export default function SystemPlayground() {
  const reduceMotion = useReducedMotion();
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const roadRefs = useRef(new Map<string, SVGPathElement>());
  const samplesRef = useRef<Record<string, Pt[]>>({});
  const lengthsRef = useRef<Record<string, number>>({});
  const timeouts = useRef<number[]>([]);

  // measure road geometry once mounted
  useEffect(() => {
    const samples: Record<string, Pt[]> = {};
    const lengths: Record<string, number> = {};
    for (const road of ROADS) {
      const el = roadRefs.current.get(road.id);
      if (!el) continue;
      const len = el.getTotalLength();
      lengths[road.id] = len;
      const pts: Pt[] = [];
      for (let i = 0; i <= 48; i++) {
        const p = el.getPointAtLength((len * i) / 48);
        pts.push({ x: p.x, y: p.y });
      }
      samples[road.id] = pts;
    }
    samplesRef.current = samples;
    lengthsRef.current = lengths;
  }, []);

  // simulation tick
  useEffect(() => {
    const id = window.setInterval(() => {
      dispatch({
        type: "TICK",
        frozen: !!reduceMotion,
        lengths: lengthsRef.current,
      });
    }, 200);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  useEffect(
    () => () => {
      timeouts.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  const registerRoad =
    (id: string) => (el: SVGPathElement | null) => {
      if (el) roadRefs.current.set(id, el);
      else roadRefs.current.delete(id);
    };

  const deployFix = () => {
    if (state.scenario === "healthy" || state.deploy) return;
    const k = reduceMotion ? 0.01 : 1;
    dispatch({ type: "DEPLOY_START" });
    timeouts.current.push(
      window.setTimeout(
        () => dispatch({ type: "DEPLOY_PHASE", phase: "rolling" }),
        1400 * k,
      ),
    );
    timeouts.current.push(
      window.setTimeout(
        () => dispatch({ type: "DEPLOY_PHASE", phase: "done" }),
        2800 * k,
      ),
    );
    timeouts.current.push(
      window.setTimeout(() => {
        dispatch({ type: "RESOLVE" });
        timeouts.current.push(
          window.setTimeout(() => dispatch({ type: "CLEAR_FLASH" }), 3000),
        );
      }, 3600 * k),
    );
  };

  const status = statusFor(state);
  const selectedNode = state.selected
    ? (systemNodes.find((n) => n.id === state.selected) ?? null)
    : null;
  const chaosDisabled = state.scenario !== "healthy";
  const deployBusy = !!state.deploy;
  const deployDisabled = deployBusy || state.scenario === "healthy";
  const nothingToFix = !deployBusy && state.scenario === "healthy";

  return (
    <figure>
      <figcaption className="mb-3 font-mono text-xs text-smoke">
        <span className="text-flame-deep">fig. 01</span>
        <span className="mx-2 text-rule">/</span>
        the system, live. it runs on your clicks, not a backend.
      </figcaption>

      <div className="overflow-x-auto pb-1">
        <div className="relative min-w-[760px]">
          <svg
            viewBox="0 0 1040 600"
            className="block w-full"
            role="img"
            aria-label="Interactive microservice architecture diagram with animated request vehicles"
          >
            {COLS.map(([label, x]) => (
              <text
                key={label}
                x={x}
                y={24}
                textAnchor="middle"
                fontSize={10}
                fill="#A39A8D"
                className="font-mono"
                style={{ letterSpacing: "0.2em" }}
              >
                {label.toUpperCase()}
              </text>
            ))}

            {/* roads */}
            {ROADS.map((r) => (
              <path
                key={r.id}
                ref={registerRoad(r.id)}
                d={r.d}
                fill="none"
                stroke="#1A1815"
                strokeWidth={1.5}
                strokeLinecap="round"
                opacity={0.55}
              />
            ))}

            {/* vehicles */}
            {state.vehicles.map((v) => (
              <VehicleGlyph key={v.id} v={v} samples={samplesRef.current} />
            ))}

            {/* nodes */}
            {GEOM.map((g) => (
              <SysNode
                key={g.id}
                geom={g}
                sim={state.nodes[g.id]}
                selected={state.selected === g.id}
                scenario={state.scenario}
                onSelect={() => dispatch({ type: "SELECT", id: g.id })}
              />
            ))}
          </svg>
        </div>
      </div>
      <p className="mt-1 font-mono text-[11px] text-faint sm:hidden">
        → scroll sideways to see the whole system. tap a node to inspect it.
      </p>

      {/* detail strip */}
      <div className="mt-5 border-y border-ink/70 py-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
            node detail
          </span>
          {selectedNode && (
            <button
              type="button"
              onClick={() => dispatch({ type: "CLEAR_SELECT" })}
              className="u-link font-mono text-[11px] uppercase tracking-[0.18em] text-smoke"
            >
              clear ×
            </button>
          )}
        </div>
        {selectedNode ? (
          <motion.div
            key={selectedNode.id}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="font-mono text-xs text-flame-deep">
              {selectedNode.label} · {selectedNode.role}
            </p>
            <p className="mt-2 max-w-2xl font-display text-xl leading-snug text-ink">
              {selectedNode.story}
            </p>
            <ul className="mt-3 max-w-3xl">
              {selectedNode.details.map((d, i) => (
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
            click any node above to inspect it.
          </p>
        )}
      </div>

      {/* hand annotation pointing at the controls */}
      <div
        className="pointer-events-none mt-6 flex items-start justify-end gap-1"
        aria-hidden="true"
      >
        <span className="mt-1 rotate-2 font-mono text-xs italic text-flame-deep">
          go on, break it.
        </span>
        <HandArrowDown />
      </div>

      {/* controls */}
      <div className="mt-1 border border-ink/70 p-4 md:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <label
              htmlFor="pg-traffic"
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke"
            >
              traffic · <span className="tnum text-ink">{state.traffic}x</span>
            </label>
            <input
              id="pg-traffic"
              type="range"
              min={1}
              max={10}
              step={1}
              value={state.traffic}
              disabled={state.scenario === "spike"}
              onChange={(e) =>
                dispatch({ type: "SET_TRAFFIC", value: Number(e.target.value) })
              }
              className="mt-3 block w-60 max-w-full accent-[#E8491D] disabled:opacity-40"
            />
            <p className="mt-2 font-mono text-[11px] text-faint">
              1x sunday morning → 10x black friday
            </p>
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              <CtlButton
                disabled={chaosDisabled}
                onClick={() => dispatch({ type: "INJECT_SLOW_QUERY" })}
              >
                inject slow query
              </CtlButton>
              <CtlButton
                disabled={chaosDisabled}
                onClick={() => dispatch({ type: "TRAFFIC_SPIKE" })}
              >
                send traffic spike
              </CtlButton>
              <CtlButton
                disabled={chaosDisabled}
                onClick={() => dispatch({ type: "KILL_PAYMENTS" })}
              >
                kill payments-svc
              </CtlButton>
              <CtlButton disabled={deployDisabled} onClick={deployFix}>
                deploy fix
              </CtlButton>
            </div>
            {nothingToFix && (
              <p className="mt-2 font-mono text-[11px] text-faint">
                deploy fix: nothing to fix
              </p>
            )}
          </div>
        </div>
        <p className="mt-4 border-t border-rule pt-3 font-mono text-xs">
          <span className="text-faint">status · </span>
          <span className={status.warn ? "text-flame-deep" : "text-ink"}>
            {status.text}
          </span>
        </p>
      </div>
    </figure>
  );
}
