import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { systemNodes } from "../data";

/* ================= geometry: big, airy, clear zones ================= */

interface NodeGeom {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const GEOM: NodeGeom[] = [
  { id: "client", x: 60, y: 308, w: 180, h: 84 },
  { id: "api-gateway", x: 360, y: 308, w: 180, h: 84 },
  { id: "auth-svc", x: 660, y: 96, w: 180, h: 84 },
  { id: "payments-svc", x: 660, y: 308, w: 180, h: 84 },
  { id: "reports-svc", x: 660, y: 520, w: 180, h: 84 },
  { id: "kafka", x: 960, y: 96, w: 180, h: 84 },
  { id: "postgres", x: 960, y: 308, w: 180, h: 84 },
  { id: "redis", x: 960, y: 520, w: 180, h: 84 },
];

interface Road {
  id: string;
  d: string;
  from: string;
  to: string;
}

const ROADS: Road[] = [
  { id: "r-client-gw", d: "M 240 350 H 360", from: "client", to: "api-gateway" },
  { id: "r-gw-auth", d: "M 540 350 H 600 V 138 H 660", from: "api-gateway", to: "auth-svc" },
  { id: "r-gw-pay", d: "M 540 350 H 660", from: "api-gateway", to: "payments-svc" },
  { id: "r-gw-rep", d: "M 540 350 H 600 V 562 H 660", from: "api-gateway", to: "reports-svc" },
  { id: "r-pay-kafka", d: "M 840 350 H 900 V 138 H 960", from: "payments-svc", to: "kafka" },
  { id: "r-pay-pg", d: "M 840 350 H 960", from: "payments-svc", to: "postgres" },
  { id: "r-pay-redis", d: "M 840 350 H 900 V 562 H 960", from: "payments-svc", to: "redis" },
  { id: "r-rep-pg", d: "M 840 562 H 900 V 350 H 960", from: "reports-svc", to: "postgres" },
  { id: "r-auth-redis", d: "M 840 138 H 900 V 562 H 960", from: "auth-svc", to: "redis" },
];

const ZONES: [string, number][] = [
  ["client", 150],
  ["gateway", 450],
  ["services", 750],
  ["data", 1050],
];

const ISO_D = 7;
const HEAT_HEX = ["#FBF8F1", "#F6EFE2", "#F2C29B", "var(--accent)"];

/* ================= request composer ================= */

type Method = "GET" | "POST" | "PUT" | "DELETE";
type VKind = "car" | "car-solid" | "bike" | "bike-solid";

const METHODS: Record<Method, string[]> = {
  GET: ["/payments/balance", "/reports/monthly", "/auth/me"],
  POST: ["/payments/charge", "/auth/token"],
  PUT: ["/payments/{id}", "/reports/{id}"],
  DELETE: ["/payments/{id}", "/auth/token"],
};

const METHOD_VEHICLE: Record<Method, VKind> = {
  GET: "car",
  POST: "car-solid",
  PUT: "bike",
  DELETE: "bike-solid",
};

interface RouteDef {
  service: string;
  outbound: string[];
  /** exact path the vehicle drives, shown on the response card */
  trace: string;
  status: string;
  body: string;
  note: string;
}

const ROUTES: Record<string, RouteDef> = {
  "GET /payments/balance": {
    service: "payments-svc",
    outbound: ["r-client-gw", "r-gw-pay", "r-pay-redis"],
    trace: "client → gateway → payments-svc → redis",
    status: "200 OK",
    body: '{ "balance": 1250.00 }',
    note: "balance read from the cache. fast.",
  },
  "GET /reports/monthly": {
    service: "reports-svc",
    outbound: ["r-client-gw", "r-gw-rep", "r-rep-pg"],
    trace: "client → gateway → reports-svc → postgres",
    status: "200 OK",
    body: '{ "month": "2026-09", "total": 88412 }',
    note: "monthly rollup from postgres.",
  },
  "GET /auth/me": {
    service: "auth-svc",
    outbound: ["r-client-gw", "r-gw-auth", "r-auth-redis"],
    trace: "client → gateway → auth-svc → redis",
    status: "200 OK",
    body: '{ "sub": "jerin.jack", "scope": "read" }',
    note: "session looked up.",
  },
  "POST /payments/charge": {
    service: "payments-svc",
    outbound: ["r-client-gw", "r-gw-pay", "r-pay-kafka"],
    trace: "client → gateway → payments-svc → kafka",
    status: "201 Created",
    body: '{ "chargeId": "ch_8H2K", "status": "captured" }',
    note: "charge accepted. the event rides kafka from here.",
  },
  "POST /auth/token": {
    service: "auth-svc",
    outbound: ["r-client-gw", "r-gw-auth", "r-auth-redis"],
    trace: "client → gateway → auth-svc → redis",
    status: "201 Created",
    body: '{ "token": "eyJhbGci…", "expiresIn": 3600 }',
    note: "token minted and stored.",
  },
  "PUT /payments/{id}": {
    service: "payments-svc",
    outbound: ["r-client-gw", "r-gw-pay", "r-pay-pg"],
    trace: "client → gateway → payments-svc → postgres",
    status: "200 OK",
    body: '{ "id": "pay_42", "status": "updated" }',
    note: "payment record updated.",
  },
  "PUT /reports/{id}": {
    service: "reports-svc",
    outbound: ["r-client-gw", "r-gw-rep", "r-rep-pg"],
    trace: "client → gateway → reports-svc → postgres",
    status: "200 OK",
    body: '{ "id": "rpt_7", "status": "updated" }',
    note: "report updated.",
  },
  "DELETE /payments/{id}": {
    service: "payments-svc",
    outbound: ["r-client-gw", "r-gw-pay", "r-pay-pg"],
    trace: "client → gateway → payments-svc → postgres",
    status: "204 No Content",
    body: "",
    note: "payment record deleted.",
  },
  "DELETE /auth/token": {
    service: "auth-svc",
    outbound: ["r-client-gw", "r-gw-auth", "r-auth-redis"],
    trace: "client → gateway → auth-svc → redis",
    status: "204 No Content",
    body: "",
    note: "token revoked.",
  },
};

/* ================= simulation ================= */

type Scenario = "healthy" | "slow-db" | "flood";

interface Pt {
  x: number;
  y: number;
}

interface FlightV {
  pts: Pt[];
  cum: number[];
  total: number;
  outLen: number;
  dist: number;
  dwellLeft: number;
  kind: VKind;
  route: RouteDef;
  method: string;
  endpoint: string;
  ms: number;
  /** wall-clock delivery timer; the response lands on this, not on the animation */
  timerId: number | null;
}

interface AmbientV {
  id: number;
  road: string;
  t: number;
  speed: number;
  kind: VKind;
}

interface NodeSim {
  rpm: number;
  avg: number;
  heat: 0 | 1 | 2 | 3;
}

interface Sim {
  scenario: Scenario;
  auto: boolean;
  flight: FlightV | null;
  ambient: AmbientV[];
  nodes: Record<string, NodeSim>;
  response: {
    route: RouteDef;
    method: string;
    endpoint: string;
    ms: number;
    key: number;
  } | null;
  nextId: number;
  /* incident game */
  incidentStart: number | null;
  incidentsFixed: number;
  bestMs: number | null;
  lastMs: number | null;
}

const DATA_NODES = ["postgres", "redis"];
const SERVICE_NODES = ["auth-svc", "payments-svc", "reports-svc"];

function initSim(): Sim {
  const nodes: Record<string, NodeSim> = {};
  for (const n of systemNodes)
    nodes[n.id] = { rpm: n.baseRpm, avg: n.baseP50, heat: 0 };
  return {
    scenario: "healthy",
    auto: true,
    flight: null,
    ambient: [],
    nodes,
    response: null,
    nextId: 1,
    incidentStart: null,
    incidentsFixed: 0,
    bestMs: null,
    lastMs: null,
  };
}

function fmtRpm(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${Math.round(n)}`;
}

function latencyFor(scenario: Scenario): number {
  if (scenario === "slow-db") return Math.round(2350 + Math.random() * 150);
  if (scenario === "flood") return Math.round(280 + Math.random() * 440);
  return Math.round(24 + Math.random() * 44);
}

/** locate a point at distance d along a cumulative polyline */
function locate(pts: Pt[], cum: number[], d: number): { x: number; y: number; ang: number } {
  const total = cum[cum.length - 1];
  const cd = Math.min(Math.max(d, 0), total);
  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < cd) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.max(1, lo);
  const d0 = cum[i - 1];
  const d1 = cum[i];
  const f = d1 > d0 ? (cd - d0) / (d1 - d0) : 0;
  const a = pts[i - 1];
  const b = pts[i];
  const x = a.x + (b.x - a.x) * f;
  const y = a.y + (b.y - a.y) * f;
  const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  return { x, y, ang };
}

/* ================= line-art vehicles ================= */

function CarArt({ solid }: { solid?: boolean }) {
  return (
    <g
      stroke="#1A1815"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={solid ? "#1A1815" : "#FBF8F1"}
    >
      <path d="M-11 3 L-11 -2 L-5 -2 L-2 -6 L6 -6 L9 -2 L11 -2 L11 3 Z" />
      <circle cx={-5.5} cy={4.5} r={2.1} fill={solid ? "#FBF8F1" : "#1A1815"} stroke="none" />
      <circle cx={5.5} cy={4.5} r={2.1} fill={solid ? "#FBF8F1" : "#1A1815"} stroke="none" />
    </g>
  );
}

function BikeArt({ solid }: { solid?: boolean }) {
  return (
    <g
      stroke={solid ? "var(--accent)" : "#1A1815"}
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

function VehicleMark({ kind }: { kind: VKind }) {
  if (kind === "car") return <CarArt />;
  if (kind === "car-solid") return <CarArt solid />;
  if (kind === "bike-solid") return <BikeArt solid />;
  return <BikeArt />;
}

/* ============ the hero car: the visitor's own request ============ */
/* Accent body, a touch larger, dark outline. Renders a fading smoke  */
/* trail from the exhaust so the eye can track the full route. This  */
/* is presentation only; the flight timing logic is untouched.        */

function HeroCarArt() {
  return (
    <g
      stroke="#1A1815"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="var(--accent)"
      transform="scale(1.3)"
    >
      <path d="M-11 3 L-11 -2 L-5 -2 L-2 -6 L6 -6 L9 -2 L11 -2 L11 3 Z" />
      <circle cx={-5.5} cy={4.5} r={2.1} fill="#FBF8F1" stroke="none" />
      <circle cx={5.5} cy={4.5} r={2.1} fill="#FBF8F1" stroke="none" />
    </g>
  );
}

interface Puff {
  id: number;
  x: number;
  y: number;
  born: number;
}

const PUFF_LIFE = 1300;

function FlightVehicle({
  x,
  y,
  ang,
  reduceMotion,
}: {
  x: number;
  y: number;
  ang: number;
  reduceMotion: boolean | null;
}) {
  const trail = useRef<Puff[]>([]);
  const idRef = useRef(0);
  const last = useRef<{ x: number; y: number } | null>(null);

  const rad = (ang * Math.PI) / 180;
  const ex = x - 17 * Math.cos(rad);
  const ey = y - 17 * Math.sin(rad);

  // Sample the exhaust after each render (the parent tick re-renders
  // ~7x/sec while the sim runs). Presentation only.
  useEffect(() => {
    if (reduceMotion) return;
    const l = last.current;
    if (!l || Math.hypot(ex - l.x, ey - l.y) > 12) {
      idRef.current += 1;
      const now = Date.now();
      trail.current = [
        ...trail.current.filter((p) => now - p.born < PUFF_LIFE),
        { id: idRef.current, x: ex, y: ey, born: now },
      ];
      last.current = { x: ex, y: ey };
    }
  });

  const now = Date.now();
  const puffs = trail.current.filter((p) => now - p.born < PUFF_LIFE);

  return (
    <g>
      {!reduceMotion &&
        puffs.map((p) => {
          const age = (now - p.born) / PUFF_LIFE;
          return (
            <circle
              key={p.id}
              cx={p.x.toFixed(1)}
              cy={p.y.toFixed(1)}
              r={(2 + age * 5).toFixed(1)}
              fill="#1A1815"
              opacity={(0.22 * (1 - age)).toFixed(2)}
            />
          );
        })}
      <g
        transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})`}
      >
        <HeroCarArt />
      </g>
    </g>
  );
}

function SysNode({
  geom,
  sim,
  selected,
  onSelect,
}: {
  geom: NodeGeom;
  sim: NodeSim;
  selected: boolean;
  onSelect: () => void;
}) {
  const node = systemNodes.find((n) => n.id === geom.id);
  if (!node) return null;
  const fill = HEAT_HEX[sim.heat];
  const ink = sim.heat === 3 ? "#FBF8F1" : "#1A1815";
  const cx = geom.x + geom.w / 2;
  const readout =
    node.baseP50 === 0
      ? `${fmtRpm(sim.rpm)} req/min`
      : `${fmtRpm(sim.rpm)} req/min · avg ${Math.round(sim.avg)}ms`;
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
      className="sysnode cursor-pointer"
    >
      <polygon
        points={`${geom.x + ISO_D},${geom.y - ISO_D} ${geom.x + geom.w + ISO_D},${geom.y - ISO_D} ${geom.x + geom.w},${geom.y} ${geom.x},${geom.y}`}
        fill="#FBF8F1"
        stroke="#1A1815"
        strokeWidth={1.25}
      />
      <rect
        x={geom.x}
        y={geom.y}
        width={geom.w}
        height={geom.h}
        fill={fill}
        stroke="#1A1815"
        strokeWidth={1.5}
      />
      {selected && (
        <rect
          x={geom.x}
          y={geom.y + geom.h + 6}
          width={geom.w}
          height={3}
          fill="var(--accent)"
        />
      )}
      <text
        x={cx}
        y={geom.y + 32}
        textAnchor="middle"
        fontSize={12}
        fill={ink}
        className="font-mono"
        style={{ letterSpacing: "0.1em" }}
      >
        {node.label.toUpperCase()}
      </text>
      <text
        x={cx}
        y={geom.y + 56}
        textAnchor="middle"
        fontSize={11}
        fill={ink}
        opacity={0.8}
        className="font-mono tnum"
      >
        {readout}
      </text>
    </g>
  );
}

function CtlButton({
  disabled,
  onClick,
  active,
  children,
}: {
  disabled?: boolean;
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/70 text-ink hover:bg-ink hover:text-paper disabled:hover:bg-transparent disabled:hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/* ================= the playground ================= */

export default function SystemPlayground() {
  const reduceMotion = useReducedMotion();
  const [sim, setSim] = useState<Sim>(initSim);
  const [method, setMethod] = useState<Method>("GET");
  const [endpoint, setEndpoint] = useState<string>(METHODS.GET[0]);
  const [selected, setSelected] = useState<string | null>(null);
  const roadRefs = useRef(new Map<string, SVGPathElement>());
  const samplesRef = useRef<Record<string, Pt[]>>({});
  const lengthsRef = useRef<Record<string, number>>({});
  const flightTimerRef = useRef<number | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const lastSeenResponse = useRef<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);

  // clear any pending timers on unmount
  useEffect(() => {
    return () => {
      if (flightTimerRef.current != null)
        window.clearTimeout(flightTimerRef.current);
      if (flashTimer.current != null) window.clearTimeout(flashTimer.current);
    };
  }, []);

  // After a response lands, bring it into view when it is below the fold,
  // so it never looks like nothing happened. Skipped under reduced motion.
  useEffect(() => {
    const key = sim.response ? String(sim.response.key) : null;
    if (!key || key === lastSeenResponse.current) return;
    lastSeenResponse.current = key;
    if (reduceMotion) return;
    const el = responseRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const visible = r.top >= 0 && r.bottom <= window.innerHeight;
    if (!visible) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [sim.response, reduceMotion]);

  useEffect(() => {
    const samples: Record<string, Pt[]> = {};
    const lengths: Record<string, number> = {};
    for (const road of ROADS) {
      const el = roadRefs.current.get(road.id);
      if (!el) continue;
      const len = el.getTotalLength();
      lengths[road.id] = len;
      const pts: Pt[] = [];
      const n = 32;
      for (let i = 0; i <= n; i++) {
        const p = el.getPointAtLength((len * i) / n);
        pts.push({ x: p.x, y: p.y });
      }
      samples[road.id] = pts;
    }
    samplesRef.current = samples;
    lengthsRef.current = lengths;
  }, []);

  /* ---- simulation tick ---- */
  useEffect(() => {
    const id = window.setInterval(() => {
      setSim((s) => {
        const lengths = lengthsRef.current;
        const frozen = !!reduceMotion;
        let { flight, ambient, nextId } = s;
        const response = s.response;

        // flight: advance the composed request, eased like a physical thing
        let newResponse = response;
        if (flight) {
          const baseSpeed =
            s.scenario === "slow-db" ? 45 : s.scenario === "flood" ? 150 : 130;
          const advance = (d: number, legStart: number, legEnd: number) => {
            const p = Math.min(
              1,
              Math.max(0, (d - legStart) / Math.max(1, legEnd - legStart)),
            );
            // ease: unhurried at the ends of each leg, quick in the middle
            const ease = frozen ? 1 : 0.35 + 0.65 * Math.sin(Math.PI * p);
            return Math.min(legEnd, d + baseSpeed * 0.15 * ease);
          };
          if (frozen) {
            // reduced motion: resolve the round trip near-instantly
            flight =
              flight.dist < flight.outLen
                ? { ...flight, dist: flight.outLen, dwellLeft: 0 }
                : { ...flight, dist: flight.total, dwellLeft: 0 };
          } else if (flight.dist < flight.outLen) {
            flight = { ...flight, dist: advance(flight.dist, 0, flight.outLen) };
          } else if (flight.dwellLeft > 0) {
            flight = { ...flight, dwellLeft: flight.dwellLeft - 150 };
          } else {
            flight = {
              ...flight,
              dist: advance(flight.dist, flight.outLen, flight.total),
            };
          }
          if (flight.dist >= flight.total) {
            newResponse = {
              route: flight.route,
              method: flight.method,
              endpoint: flight.endpoint,
              ms: flight.ms,
              key: nextId,
            };
            nextId += 1;
            flight = null;
          }
        }

        // ambient traffic: sparse by default, floods on demand
        const maxAmbient = s.scenario === "flood" ? 36 : s.scenario === "slow-db" ? 4 : 8;
        ambient = ambient
          .map((v) => {
            if (frozen) return v;
            const len = lengths[v.road] ?? 200;
            const t = Math.min(1, Math.max(0, v.t));
            const ease = 0.7 + 0.3 * Math.sin(Math.PI * t);
            return { ...v, t: v.t + ((v.speed * 0.15) / len) * ease };
          })
          .filter((v) => v.t < 1);
        if (s.auto && !frozen && ambient.length < maxAmbient && Math.random() < (s.scenario === "flood" ? 0.75 : 0.3)) {
          const road = ROADS[Math.floor(Math.random() * ROADS.length)];
          const kinds: VKind[] = ["car", "car", "bike"];
          ambient = [
            ...ambient,
            {
              id: nextId,
              road: road.id,
              t: 0,
              speed: 55 + Math.random() * 40,
              kind: kinds[Math.floor(Math.random() * kinds.length)],
            },
          ];
          nextId += 1;
        }

        // metrics drift toward scenario targets
        const nodes: Record<string, NodeSim> = {};
        for (const sn of systemNodes) {
          const n = { ...s.nodes[sn.id] };
          let avgTarget = sn.baseP50;
          let heatTarget: 0 | 1 | 2 | 3 = 0;
          let rpmMul = 1;
          if (s.scenario === "slow-db") {
            if (DATA_NODES.includes(sn.id)) {
              avgTarget = 2400;
              heatTarget = 3;
            } else if (sn.id === "kafka") {
              avgTarget = sn.baseP50 * 2;
              heatTarget = 1;
            }
          } else if (s.scenario === "flood") {
            avgTarget = sn.baseP50 === 0 ? 0 : sn.baseP50 * 2.5 + 40;
            rpmMul = 3;
            if (sn.id === "kafka") heatTarget = 3;
            else if (SERVICE_NODES.includes(sn.id)) heatTarget = 2;
            else if (sn.id !== "client") heatTarget = 1;
          }
          n.avg += (avgTarget - n.avg) * 0.25;
          if (n.heat < heatTarget) n.heat = (n.heat + 1) as 0 | 1 | 2 | 3;
          else if (n.heat > heatTarget) n.heat = (n.heat - 1) as 0 | 1 | 2 | 3;
          const rpmTarget = sn.baseRpm * rpmMul * (0.85 + Math.random() * 0.3);
          n.rpm += (rpmTarget - n.rpm) * 0.2;
          nodes[sn.id] = n;
        }

        return { ...s, flight, ambient, nodes, response: newResponse, nextId };
      });
    }, 150);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const registerRoad = (id: string) => (el: SVGPathElement | null) => {
    if (el) roadRefs.current.set(id, el);
    else roadRefs.current.delete(id);
  };

  const send = () => {
    const route = ROUTES[`${method} ${endpoint}`];
    if (!route) return;
    const samples = samplesRef.current;
    const raw: Pt[] = [];
    for (const rid of route.outbound) {
      const pts = samples[rid];
      if (!pts) return;
      for (let i = 0; i < pts.length; i++) {
        if (raw.length > 0 && i === 0) continue;
        raw.push(pts[i]);
      }
    }
    const back = [...raw].reverse().slice(1);
    const full = [...raw, ...back];
    const cum: number[] = [0];
    for (let i = 1; i < full.length; i++) {
      const a = full[i - 1];
      const b = full[i];
      cum.push(cum[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
    }
    const total = cum[cum.length - 1];
    const outLen = cum[raw.length - 1];
    const ms = latencyFor(sim.scenario);
    const dwell = sim.scenario === "slow-db" ? 1800 : 450;
    // The response is delivered on a wall-clock timer of exactly the simulated
    // latency, decoupled from the incident lifecycle and from the vehicle
    // animation (which crawls during slow-db). The incident clock keeps ticking
    // until "fix everything"; the request itself always completes on time.
    const flight: FlightV = {
      pts: full,
      cum,
      total,
      outLen,
      dist: 0,
      dwellLeft: dwell,
      kind: METHOD_VEHICLE[method],
      route,
      method,
      endpoint,
      ms,
      timerId: null,
    };
    const timerId = window.setTimeout(() => {
      flightTimerRef.current = null;
      setSim((s) => {
        const f = s.flight;
        // stale timer (a newer flight already resolved) or already delivered
        if (!f || f.timerId !== timerId) return s;
        return {
          ...s,
          flight: null,
          response: {
            route: f.route,
            method: f.method,
            endpoint: f.endpoint,
            ms: f.ms,
            key: s.nextId,
          },
          nextId: s.nextId + 1,
        };
      });
    }, ms);
    flight.timerId = timerId;
    flightTimerRef.current = timerId;
    setSim((s) =>
      s.flight
        ? s
        : {
            ...s,
            response: null,
            flight,
          },
    );
  };

  // Auto-traffic toggle with a brief status flash so the effect is
  // unmistakable: the status line announces the new state, then fades back.
  const toggleAuto = () => {
    const next = !sim.auto;
    setSim((s) => ({ ...s, auto: next }));
    setFlash(next ? "auto traffic on · roads live" : "auto traffic off · roads quiet");
    if (flashTimer.current != null) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 2600);
  };

  const setScenario = (sc: Scenario) =>
    setSim((s) => {
      if (sc === s.scenario) return s;
      if (sc === "healthy") {
        // fix everything: stop the incident clock, log the score
        if (s.incidentStart == null) return { ...s, scenario: sc };
        const ms = (Date.now() - s.incidentStart) / 1000;
        return {
          ...s,
          scenario: sc,
          incidentStart: null,
          incidentsFixed: s.incidentsFixed + 1,
          bestMs: s.bestMs == null ? ms : Math.min(s.bestMs, ms),
          lastMs: ms,
        };
      }
      // chaos: open an incident, start the clock
      return { ...s, scenario: sc, incidentStart: Date.now() };
    });

  const incidentSecs =
    sim.incidentStart != null
      ? Math.floor((Date.now() - sim.incidentStart) / 1000)
      : null;

  const statusText = (): string => {
    if (sim.flight) return "request on its way…";
    if (sim.scenario === "slow-db")
      return `the database is slow. incident open · ${incidentSecs ?? 0}s`;
    if (sim.scenario === "flood")
      return `traffic flood. incident open · ${incidentSecs ?? 0}s`;
    if (sim.lastMs != null)
      return `all clear · last incident resolved in ${sim.lastMs.toFixed(0)}s`;
    return "all clear";
  };
  const statusDot =
    sim.scenario === "slow-db"
      ? "bg-flame"
      : sim.scenario === "flood"
        ? "bg-warn"
        : "bg-ok";

  const selectedNode = selected
    ? (systemNodes.find((n) => n.id === selected) ?? null)
    : null;

  const flightPos = sim.flight ? locate(sim.flight.pts, sim.flight.cum, sim.flight.dist) : null;

  return (
    <figure className="scroll-mt-24">
      <p className="mb-1 font-mono text-xs text-smoke">
        the system, live. compose a request and send it.
      </p>
      <p className="mb-4 font-mono text-[11px] text-faint">
        a toy model. it runs on your clicks, not a backend.
      </p>

      {/* composer */}
      <div className="border border-ink/70 p-4 md:p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
          compose a request
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(METHODS) as Method[]).map((m) => (
            <CtlButton
              key={m}
              active={method === m}
              onClick={() => {
                setMethod(m);
                setEndpoint(METHODS[m][0]);
              }}
            >
              {m}
            </CtlButton>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {METHODS[method].map((e) => (
            <CtlButton
              key={e}
              active={endpoint === e}
              onClick={() => setEndpoint(e)}
            >
              {e}
            </CtlButton>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={send}
            disabled={!!sim.flight}
            className="border border-ink bg-ink px-6 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-paper transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sim.flight ? "on its way…" : "send →"}
          </button>
          <button
            type="button"
            onClick={toggleAuto}
            className="u-link font-mono text-[11px] uppercase tracking-[0.16em] text-smoke"
          >
            auto traffic: {sim.auto ? "on" : "off"}
          </button>
          {sim.flight && (
            <span className="tnum font-mono text-[11px] uppercase tracking-[0.16em] text-flame-deep">
              request on the road…
            </span>
          )}
        </div>

        <div className="mt-5 border-t border-rule pt-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
            trouble
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <CtlButton
              disabled={sim.scenario !== "healthy"}
              onClick={() => setScenario("slow-db")}
            >
              slow the database
            </CtlButton>
            <CtlButton
              disabled={sim.scenario !== "healthy"}
              onClick={() => setScenario("flood")}
            >
              flood the traffic
            </CtlButton>
            <CtlButton
              disabled={sim.scenario === "healthy"}
              onClick={() => setScenario("healthy")}
            >
              fix everything
            </CtlButton>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-3 font-mono text-xs">
          <p>
            <span
              aria-hidden="true"
              className={`mr-2 inline-block h-2 w-2 ${statusDot}`}
            />
            <span className="text-faint">status · </span>
            <span
              className={
                sim.scenario !== "healthy" ? "text-flame-deep" : "text-ink"
              }
            >
              {flash ?? statusText()}
            </span>
          </p>
          <p className="tnum text-faint">
            incidents fixed: {sim.incidentsFixed}
            {" · "}best:{" "}
            {sim.bestMs != null ? `${sim.bestMs.toFixed(0)}s` : "-"}
          </p>
        </div>
      </div>

      {/* diagram */}
      <div className="mt-6 overflow-x-auto pb-1">
        <div className="relative min-w-[900px]">
          <svg
            viewBox="0 0 1200 700"
            className="block w-full"
            role="img"
            aria-label="Interactive system diagram. Compose a request above and watch it travel."
          >
            {ZONES.map(([label, x]) => (
              <text
                key={label}
                x={x}
                y={34}
                textAnchor="middle"
                fontSize={11}
                fill="#A39A8D"
                className="font-mono"
                style={{ letterSpacing: "0.2em" }}
              >
                {label.toUpperCase()}
              </text>
            ))}
            {ROADS.map((r) => (
              <path
                key={r.id}
                ref={registerRoad(r.id)}
                d={r.d}
                fill="none"
                stroke="#1A1815"
                strokeWidth={1.5}
                strokeLinecap="round"
                opacity={0.5}
              />
            ))}
            {/* ambient vehicles */}
            {sim.ambient.map((v) => {
              const pts = samplesRef.current[v.road];
              if (!pts) return null;
              const f = Math.min(0.999, Math.max(0, v.t)) * (pts.length - 1);
              const i = Math.floor(f);
              const a = pts[i];
              const b = pts[Math.min(pts.length - 1, i + 1)];
              const frac = f - i;
              const x = a.x + (b.x - a.x) * frac;
              const y = a.y + (b.y - a.y) * frac;
              const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
              return (
                <g
                  key={v.id}
                  transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})`}
                  opacity={0.75}
                >
                  <VehicleMark kind={v.kind} />
                </g>
              );
            })}
            {/* the composed request: the hero car, with a smoke trail */}
            {sim.flight && flightPos && (
              <FlightVehicle
                x={flightPos.x}
                y={flightPos.y}
                ang={flightPos.ang}
                reduceMotion={reduceMotion}
              />
            )}
            {GEOM.map((g) => (
              <SysNode
                key={g.id}
                geom={g}
                sim={sim.nodes[g.id]}
                selected={selected === g.id}
                onSelect={() => setSelected(g.id)}
              />
            ))}
          </svg>
        </div>
      </div>
      <p className="mt-1 font-mono text-[11px] text-faint sm:hidden">
        → scroll sideways to see the whole system. tap a node to read its story.
      </p>

      {/* response card */}
      <div ref={responseRef} className="mt-5 min-h-[132px] scroll-mt-24 border-y border-ink/70 py-5">
        {sim.response ? (
          <motion.div
            key={sim.response.key}
            initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 320, damping: 26 }
            }
          >
            <p className="font-mono text-sm font-medium text-ink">
              {sim.response.method} {sim.response.endpoint}
            </p>
            <p className="tnum mt-1 font-mono text-[11px] text-faint">
              {sim.response.route.trace}
            </p>
            <p className="tnum mt-2 font-mono text-sm text-flame-deep">
              ← {sim.response.route.status} · {sim.response.ms}ms
            </p>
            <pre className="tnum mt-2 inline-block border border-rule bg-cool-1 px-3 py-2 font-mono text-sm text-ink">
              {sim.response.route.body === ""
                ? "(empty body. that is the whole point)"
                : sim.response.route.body}
            </pre>
            <p className="mt-2 text-[15px] text-ink/85">{sim.response.route.note}</p>
            <p className="mt-2 font-mono text-[11px] text-faint">
              served by spring boot · jackson json · x-powered-by: spring-boot
            </p>
          </motion.div>
        ) : (
          <p className="font-mono text-sm text-faint">
            {sim.flight
              ? "watch it drive the round trip…"
              : "your response will land here. pick a method, pick an endpoint, hit send."}
          </p>
        )}
      </div>

      {/* node detail */}
      <div className="mt-5 border-b border-ink/70 pb-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
            node detail
          </span>
          {selectedNode && (
            <button
              type="button"
              onClick={() => setSelected(null)}
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
            <p className="mt-2 max-w-2xl font-display text-xl font-medium leading-snug text-ink">
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
            click any node above to read its story.
          </p>
        )}
      </div>
    </figure>
  );
}
