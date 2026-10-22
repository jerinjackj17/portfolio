import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { systemNodes } from "../data";
import { getThemeMode, subscribeTheme, type ThemeMode } from "../theme";

/* ================= geometry: big, airy, clear zones ================= */

interface NodeGeom {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const GEOM: NodeGeom[] = [
  // edge
  { id: "cdn", x: 45, y: 70, w: 170, h: 72 },
  { id: "waf", x: 45, y: 270, w: 170, h: 72 },
  // client + gateway
  { id: "client", x: 290, y: 270, w: 170, h: 72 },
  { id: "api-gateway", x: 535, y: 270, w: 170, h: 72 },
  // microservices (inside the kubernetes boundary)
  { id: "auth-svc", x: 780, y: 70, w: 170, h: 72 },
  { id: "payments-svc", x: 780, y: 270, w: 170, h: 72 },
  { id: "reports-svc", x: 780, y: 470, w: 170, h: 72 },
  { id: "fraud-svc", x: 780, y: 670, w: 170, h: 72 },
  { id: "ledger-svc", x: 780, y: 870, w: 170, h: 72 },
  // streaming
  { id: "kafka", x: 1025, y: 270, w: 170, h: 72 },
  { id: "notify-svc", x: 1025, y: 670, w: 170, h: 72 },
  // data
  { id: "postgres", x: 1270, y: 70, w: 170, h: 72 },
  { id: "postgres-replica", x: 1270, y: 270, w: 170, h: 72 },
  { id: "redis", x: 1270, y: 470, w: 170, h: 72 },
  { id: "elasticsearch", x: 1270, y: 670, w: 170, h: 72 },
  { id: "object-storage", x: 1270, y: 870, w: 170, h: 72 },
  // delivery + observability band
  { id: "jenkins", x: 290, y: 970, w: 170, h: 72 },
  { id: "prometheus", x: 780, y: 970, w: 170, h: 72 },
  { id: "grafana", x: 990, y: 970, w: 170, h: 72 },
  { id: "jaeger", x: 1200, y: 970, w: 170, h: 72 },
];

interface Road {
  id: string;
  d: string;
  from: string;
  to: string;
  /** ambient roads are dashed context: drawn, never driven by trips */
  ambient?: boolean;
}

const ROADS: Road[] = [
  // the request path: every road a trip can drive
  { id: "r-client-gw", d: "M 460 306 H 535", from: "client", to: "api-gateway" },
  { id: "r-gw-auth", d: "M 705 306 H 742 V 106 H 780", from: "api-gateway", to: "auth-svc" },
  { id: "r-gw-pay", d: "M 705 306 H 780", from: "api-gateway", to: "payments-svc" },
  { id: "r-gw-rep", d: "M 705 306 H 742 V 506 H 780", from: "api-gateway", to: "reports-svc" },
  { id: "r-pay-kafka", d: "M 950 306 H 1025", from: "payments-svc", to: "kafka" },
  { id: "r-pay-pg", d: "M 950 306 H 1090 V 106 H 1270", from: "payments-svc", to: "postgres" },
  { id: "r-pay-redis", d: "M 950 306 H 1090 V 506 H 1270", from: "payments-svc", to: "redis" },
  { id: "r-rep-pg", d: "M 950 506 H 1130 V 106 H 1270", from: "reports-svc", to: "postgres" },
  { id: "r-auth-redis", d: "M 950 106 H 1130 V 506 H 1270", from: "auth-svc", to: "redis" },
  // platform context: dashed, never driven
  { id: "r-cdn-waf", d: "M 130 142 V 270", from: "cdn", to: "waf", ambient: true },
  { id: "r-waf-client", d: "M 215 306 H 290", from: "waf", to: "client", ambient: true },
  { id: "r-client-cdn", d: "M 375 270 V 106 H 215", from: "client", to: "cdn", ambient: true },
  { id: "r-gw-fraud", d: "M 705 306 H 742 V 706 H 780", from: "api-gateway", to: "fraud-svc", ambient: true },
  { id: "r-kafka-notify", d: "M 1110 342 V 670", from: "kafka", to: "notify-svc", ambient: true },
  { id: "r-kafka-ledger", d: "M 1025 306 H 987 V 906 H 950", from: "kafka", to: "ledger-svc", ambient: true },
  { id: "r-pg-replica", d: "M 1355 142 V 270", from: "postgres", to: "postgres-replica", ambient: true },
  { id: "r-rep-es", d: "M 950 506 H 1170 V 706 H 1270", from: "reports-svc", to: "elasticsearch", ambient: true },
  { id: "r-pay-s3", d: "M 950 306 H 1210 V 906 H 1270", from: "payments-svc", to: "object-storage", ambient: true },
  { id: "r-graf-prom", d: "M 990 1006 H 950", from: "grafana", to: "prometheus", ambient: true },
  { id: "r-jenkins-ship", d: "M 460 1006 H 760 V 962", from: "jenkins", to: "payments-svc", ambient: true },
];

const ZONES: [string, number][] = [
  ["edge", 130],
  ["client", 375],
  ["gateway", 620],
  ["kubernetes · eks", 865],
  ["streaming", 1110],
  ["data", 1355],
];

const ISO_D = 7;
/* SVG art needs literal colors; they follow the site theme (src/theme.ts). */
const PALETTES = {
  light: {
    INK: "#1A1815",
    PAPER: "#FBF8F1",
    FAINT: "#A39A8D",
    HEAT: ["#FBF8F1", "#F6EFE2", "#F2C29B", "var(--accent)"],
  },
  dark: {
    INK: "#F0E9DA",
    PAPER: "#171410",
    FAINT: "#7D7462",
    HEAT: ["#171410", "#2A2115", "#8A4B24", "var(--accent)"],
  },
} as const;

function usePalette() {
  const [mode, setMode] = useState<ThemeMode>(() => getThemeMode());
  useEffect(() => subscribeTheme(setMode), []);
  return PALETTES[mode];
}

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

interface Trip {
  id: number;
  /** true = the visitor's composed request (the star). false = ambient traffic. */
  user: boolean;
  kind: VKind;
  route: RouteDef;
  method: string;
  endpoint: string;
  /** simulated latency shown on the response card */
  ms: number;
  /** full round-trip polyline: outbound legs, then the reverse path back */
  pts: Pt[];
  cum: number[];
  total: number;
  outLen: number;
  /** cumulative distances of intermediate node stops on the way out */
  stops: number[];
  stopIdx: number;
  /** which stops trigger a pause (user: every node; ambient: gateway only in a flood) */
  pauseStops: boolean[];
  pauseLeft: number;
  pauseMs: number;
  dist: number;
  /** processing beat at the data node before the return leg */
  processLeft: number;
  processMs: number;
  processAge: number;
  pulse: { x: number; y: number } | null;
  /** px per second along the path */
  speed: number;
  /** the user's car leaves a two-color trail; ambient cars leave none */
  trail: boolean;
  dim: number;
  scale: number;
}

interface NodeSim {
  rpm: number;
  avg: number;
  heat: 0 | 1 | 2 | 3;
}

interface Sim {
  scenario: Scenario;
  auto: boolean;
  /** trip-speed slider: scales the whole visualization, not the latency numbers */
  speedMul: number;
  /** active round trips: the visitor's requests */
  trips: Trip[];
  /** active round trips: ambient traffic (full out-and-back, dimmer, slower) */
  ambient: Trip[];
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

const DATA_NODES = ["postgres", "postgres-replica", "redis", "elasticsearch", "object-storage"];
const SERVICE_NODES = ["auth-svc", "payments-svc", "reports-svc", "fraud-svc", "ledger-svc", "notify-svc"];

function initSim(): Sim {
  const nodes: Record<string, NodeSim> = {};
  for (const n of systemNodes)
    nodes[n.id] = { rpm: n.baseRpm, avg: n.baseP50, heat: 0 };
  return {
    scenario: "healthy",
    auto: true,
    speedMul: 1,
    trips: [],
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

/* ================= round-trip builder ================= */
/* A trip drives the full route: client → gateway → service → data node
   (pausing briefly at each node), a processing beat at the data node,
   then the reverse path home. The response card lands when the car
   arrives back at the client. Outbound and return are different colors. */

function assembleTrip(
  id: number,
  user: boolean,
  method: string,
  endpoint: string,
  route: RouteDef,
  scenario: Scenario,
  kind: VKind,
  samples: Record<string, Pt[]>,
): Trip | null {
  const raw: Pt[] = [];
  const legEndIdx: number[] = [];
  for (const rid of route.outbound) {
    const pts = samples[rid];
    if (!pts) return null;
    for (let i = 0; i < pts.length; i++) {
      if (raw.length > 0 && i === 0) continue;
      raw.push(pts[i]);
    }
    legEndIdx.push(raw.length - 1);
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
  // intermediate node stops on the way out (gateway, then the service)
  const stops = legEndIdx.slice(0, -1).map((i) => cum[i]);

  const lastRoad = ROADS.find(
    (r) => r.id === route.outbound[route.outbound.length - 1],
  );
  const dataGeom = GEOM.find((g) => g.id === lastRoad?.to);
  const pulse = dataGeom
    ? { x: dataGeom.x + dataGeom.w / 2, y: dataGeom.y + dataGeom.h / 2 }
    : null;

  const ms = latencyFor(scenario);
  // incident pace: the whole trip feels sluggish when the database is slow,
  // a touch heavy in a flood. Baked into the car's speed at creation.
  const pace = scenario === "slow-db" ? 0.35 : scenario === "flood" ? 0.85 : 1;
  const pauseMs = user ? Math.round(250 / pace) : 300 + Math.random() * 600;
  // slow-db: the car visibly waits at the data node for the incident latency
  const processMs = !user
    ? 300
    : scenario === "slow-db"
      ? 2400
      : scenario === "flood"
        ? 250
        : 450;
  const nodePauseTotal = user ? stops.length * pauseMs : 0;
  // a healthy round trip takes about six watchable seconds; the user's car
  // is quicker than ambient traffic so the composed request stays the star
  const targetMs = user
    ? scenario === "flood"
      ? 2600
      : 6000
    : scenario === "flood"
      ? 3400
      : 7000;
  const driveMs = Math.max(900, targetMs - nodePauseTotal - processMs);
  // the per-leg easing averages ~0.76, so compensate to hit the target;
  // pace slows the whole drive when the system is sick
  const speed = (total / ((driveMs / 1000) * 0.76)) * pace;

  return {
    id,
    user,
    kind,
    route,
    method,
    endpoint,
    ms,
    pts: full,
    cum,
    total,
    outLen,
    stops,
    stopIdx: 0,
    pauseStops: user
      ? stops.map(() => true)
      : stops.map((_, i) => scenario === "flood" && i === 0),
    pauseLeft: 0,
    pauseMs,
    dist: 0,
    processLeft: 0,
    processMs,
    processAge: 0,
    pulse,
    speed,
    trail: user,
    dim: user ? 1 : 0.5,
    scale: user ? 1.3 : 0.85,
  };
}

/** advance one trip by a 150ms tick. vizMul (the trip-speed slider) scales the
    whole animation: car travel, node pauses, smoke pacing. The simulated
    latency number on the response card is untouched. Returns the trip and
    whether it arrived home. */
function stepTrip(
  t: Trip,
  frozen: boolean,
  vizMul: number,
): { trip: Trip; arrived: boolean } {
  if (frozen) {
    return {
      trip: { ...t, dist: t.total, pauseLeft: 0, processLeft: 0 },
      arrived: true,
    };
  }
  let { dist, pauseLeft, processLeft, processAge, stopIdx } = t;
  let arrived = false;
  const ease = (d: number, len: number) => {
    const p = Math.min(1, Math.max(0, d / Math.max(1, len)));
    return 0.35 + 0.65 * Math.sin(Math.PI * p);
  };
  if (pauseLeft > 0) {
    // held at a node: you can see it wait
    pauseLeft -= 150 * vizMul;
  } else if (dist < t.outLen) {
    const step = t.speed * vizMul * 0.15 * ease(dist, t.outLen);
    const stop = t.stops[stopIdx];
    if (stop != null && dist + step >= stop) {
      dist = stop;
      if (t.pauseStops[stopIdx]) pauseLeft = t.pauseMs;
      stopIdx += 1;
    } else {
      dist = Math.min(t.outLen, dist + step);
    }
    if (dist >= t.outLen) {
      processLeft = t.processMs;
      processAge = 0;
    }
  } else if (processLeft > 0) {
    // processing beat at the data node; the pulse rings play here
    processLeft -= 150 * vizMul;
    processAge += 150 * vizMul;
  } else if (dist < t.total) {
    const step = t.speed * vizMul * 0.15 * ease(dist - t.outLen, t.total - t.outLen);
    dist = Math.min(t.total, dist + step);
    if (dist >= t.total) arrived = true;
  }
  return {
    trip: { ...t, dist, pauseLeft, processLeft, processAge, stopIdx },
    arrived,
  };
}

/* ================= line-art vehicles ================= */

function CarArt({ solid }: { solid?: boolean }) {
  const { INK, PAPER } = usePalette();
  return (
    <g
      stroke={INK}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={solid ? INK : PAPER}
    >
      <path d="M-11 3 L-11 -2 L-6 -2 L-4 -6 L2 -6 L6 -2 L11 -2 L11 3 Z" />
      {/* windshield, then the headlight: the front is +x, always */}
      <path d="M2 -6 L6 -2" strokeWidth={1.25} />
      <circle cx={9.2} cy={0.2} r={1.4} fill={PAPER} strokeWidth={1} />
      <circle cx={-5.5} cy={4.5} r={2.1} fill={solid ? PAPER : INK} stroke="none" />
      <circle cx={5.5} cy={4.5} r={2.1} fill={solid ? PAPER : INK} stroke="none" />
    </g>
  );
}

function BikeArt({ solid }: { solid?: boolean }) {
  const { INK } = usePalette();
  return (
    <g
      stroke={solid ? "var(--accent)" : INK}
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
/* Accent body on the way out, return-green on the way back, a touch    */
/* larger, dark outline. The front is +x (headlight + windshield), so   */
/* rotate(ang) always faces the direction of travel, out and back. The   */
/* exhaust smoke takes the same color as the car, so outbound and       */
/* return read as two different journeys.                               */

const RETURN_GREEN = "#2e7d32";

function HeroCarArt({ tone }: { tone: "out" | "back" }) {
  const { INK, PAPER } = usePalette();
  return (
    <g
      stroke={INK}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={tone === "out" ? "var(--accent)" : RETURN_GREEN}
      transform="scale(1.3)"
    >
      <path d="M-11 3 L-11 -2 L-6 -2 L-4 -6 L2 -6 L6 -2 L11 -2 L11 3 Z" />
      <path d="M2 -6 L6 -2" strokeWidth={1.25} />
      <circle cx={9.2} cy={0.2} r={1.4} fill={PAPER} strokeWidth={1} />
      <circle cx={-5.5} cy={4.5} r={2.1} fill={PAPER} stroke="none" />
      <circle cx={5.5} cy={4.5} r={2.1} fill={PAPER} stroke="none" />
    </g>
  );
}

interface Puff {
  id: number;
  x: number;
  y: number;
  born: number;
  color: string;
}

const PUFF_LIFE = 2200;

function TripVehicle({
  trip,
  x,
  y,
  ang,
  reduceMotion,
}: {
  trip: Trip;
  x: number;
  y: number;
  ang: number;
  reduceMotion: boolean | null;
}) {
  const trail = useRef<Puff[]>([]);
  const idRef = useRef(0);
  const last = useRef<{ x: number; y: number } | null>(null);

  const tone: "out" | "back" = trip.dist <= trip.outLen ? "out" : "back";
  const puffColor = tone === "out" ? "var(--accent)" : RETURN_GREEN;

  const rad = (ang * Math.PI) / 180;
  const ex = x - 17 * Math.cos(rad);
  const ey = y - 17 * Math.sin(rad);

  // Sample the exhaust after each render (the parent tick re-renders
  // ~7x/sec while the sim runs). Two puffs per sample with a little
  // jitter, plus a gentle idle puff while the car waits at a node.
  // Presentation only.
  useEffect(() => {
    if (reduceMotion || !trip.trail) return;
    const l = last.current;
    const moved = l ? Math.hypot(ex - l.x, ey - l.y) : Infinity;
    const idling = trip.pauseLeft > 0 || trip.processLeft > 0;
    if (moved > 7 || idling) {
      const now = Date.now();
      const fresh: Puff[] = [];
      const n = moved > 7 ? 2 : 1;
      for (let k = 0; k < n; k++) {
        idRef.current += 1;
        fresh.push({
          id: idRef.current,
          x: ex + (Math.random() * 8 - 4),
          y: ey + (Math.random() * 8 - 4),
          born: now - k * 70,
          color: puffColor,
        });
      }
      trail.current = [
        ...trail.current.filter((p) => now - p.born < PUFF_LIFE),
        ...fresh,
      ].slice(-48);
      last.current = { x: ex, y: ey };
    }
  });

  const now = Date.now();
  const puffs = trail.current.filter((p) => now - p.born < PUFF_LIFE);

  return (
    <g opacity={trip.dim}>
      {!reduceMotion &&
        puffs.map((p) => {
          const age = (now - p.born) / PUFF_LIFE;
          return (
            <circle
              key={p.id}
              cx={p.x.toFixed(1)}
              cy={p.y.toFixed(1)}
              r={(3.5 + age * 9).toFixed(1)}
              fill={p.color}
              opacity={(0.7 * (1 - age)).toFixed(2)}
            />
          );
        })}
      <g
        transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${trip.scale})`}
      >
        {trip.user ? (
          <HeroCarArt tone={tone} />
        ) : (
          <VehicleMark kind={trip.kind} />
        )}
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
  const { INK, PAPER, HEAT } = usePalette();
  const node = systemNodes.find((n) => n.id === geom.id);
  if (!node) return null;
  const fill = HEAT[sim.heat];
  const ink = sim.heat === 3 ? "#FBF8F1" : INK;
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
        fill={PAPER}
        stroke={INK}
        strokeWidth={1.25}
      />
      <rect
        x={geom.x}
        y={geom.y}
        width={geom.w}
        height={geom.h}
        fill={fill}
        stroke={INK}
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
      className={`border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
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
  const { INK, FAINT } = usePalette();
  const reduceMotion = useReducedMotion();
  const [sim, setSim] = useState<Sim>(initSim);
  const [method, setMethod] = useState<Method>("GET");
  const [endpoint, setEndpoint] = useState<string>(METHODS.GET[0]);
  const [selected, setSelected] = useState<string | null>(null);
  const roadRefs = useRef(new Map<string, SVGPathElement>());
  const samplesRef = useRef<Record<string, Pt[]>>({});
  const responseRef = useRef<HTMLDivElement>(null);
  const lastSeenResponse = useRef<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);

  // clear any pending timers on unmount
  useEffect(() => {
    return () => {
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
    for (const road of ROADS) {
      const el = roadRefs.current.get(road.id);
      if (!el) continue;
      const len = el.getTotalLength();
      const pts: Pt[] = [];
      const n = 32;
      for (let i = 0; i <= n; i++) {
        const p = el.getPointAtLength((len * i) / n);
        pts.push({ x: p.x, y: p.y });
      }
      samples[road.id] = pts;
    }
    samplesRef.current = samples;
  }, []);

  /* ---- simulation tick ---- */
  useEffect(() => {
    const id = window.setInterval(() => {
      setSim((s) => {
        const frozen = !!reduceMotion;
        let { trips, ambient, nextId } = s;
        let newResponse = s.response;

        // round trips: the visitor's requests drive out, pause at nodes,
        // take a processing beat at the data node, then drive home.
        // The response card lands when a car arrives back at the client.
        const stepAll = (list: Trip[]) => {
          const kept: Trip[] = [];
          for (const t of list) {
            const { trip, arrived } = stepTrip(t, frozen, s.speedMul);
            if (arrived) {
              if (trip.user) {
                newResponse = {
                  route: trip.route,
                  method: trip.method,
                  endpoint: trip.endpoint,
                  ms: trip.ms,
                  key: nextId,
                };
                nextId += 1;
              }
            } else {
              kept.push(trip);
            }
          }
          return kept;
        };
        trips = stepAll(trips);

        // ambient traffic: full round trips too, dimmer and slower than the
        // visitor's car so the composed request is always the star
        const samples = samplesRef.current;
        const maxAmbient =
          s.scenario === "flood" ? 22 : s.scenario === "slow-db" ? 3 : 6;
        ambient = stepAll(ambient);
        if (
          s.auto &&
          !frozen &&
          ambient.length < maxAmbient &&
          Math.random() < (s.scenario === "flood" ? 0.6 : 0.25)
        ) {
          const keys = Object.keys(ROUTES);
          const route = ROUTES[keys[Math.floor(Math.random() * keys.length)]];
          const kinds: VKind[] = ["car", "car", "bike"];
          const trip = assembleTrip(
            nextId,
            false,
            "",
            "",
            route,
            s.scenario,
            kinds[Math.floor(Math.random() * kinds.length)],
            samples,
          );
          if (trip) {
            ambient = [...ambient, trip];
            nextId += 1;
          }
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

        return { ...s, trips, ambient, nodes, response: newResponse, nextId };
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
    setSim((s) => {
      const userTrips = s.trips.filter((t) => t.user);
      // one request at a time normally; a flood lets several fly at once
      if (userTrips.length > 0 && s.scenario !== "flood") return s;
      if (userTrips.length >= 4) return s;
      const trip = assembleTrip(
        s.nextId,
        true,
        method,
        endpoint,
        route,
        s.scenario,
        METHOD_VEHICLE[method],
        samples,
      );
      if (!trip) return s;
      return {
        ...s,
        trips: [...s.trips, trip],
        response: userTrips.length === 0 ? null : s.response,
        nextId: s.nextId + 1,
      };
    });
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

  const setScenario = (sc: Scenario) => {
    // Let the ambient background log react to the incident lifecycle.
    window.dispatchEvent(
      new CustomEvent("jj:scenario", { detail: { scenario: sc } }),
    );
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
  };

  const incidentSecs =
    sim.incidentStart != null
      ? Math.floor((Date.now() - sim.incidentStart) / 1000)
      : null;

  const userActive = sim.trips.some((t) => t.user);

  const statusText = (): string => {
    if (userActive) return "request on its way…";
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

  return (
    <figure className="scroll-mt-24">
      <p className="mb-3 font-mono text-xs text-smoke">
        the system, live.{" "}
        <span className="text-faint">
          a toy model. it runs on your clicks, not a backend.
        </span>
      </p>

      {/* composer: one compact control bar */}
      <div className="border border-ink/70 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
            compose
          </span>
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
          <span aria-hidden="true" className="font-mono text-[11px] text-faint">
            /
          </span>
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
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-rule pt-2">
          <button
            type="button"
            onClick={send}
            disabled={userActive && sim.scenario !== "flood"}
            className="border border-ink bg-ink px-6 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-paper transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {userActive ? "on its way…" : "send →"}
          </button>
          <button
            type="button"
            onClick={toggleAuto}
            className="u-link font-mono text-[11px] uppercase tracking-[0.16em] text-smoke"
          >
            auto traffic: {sim.auto ? "on" : "off"}
          </button>
          <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-smoke">
            trip speed
            <span className="text-faint">slower</span>
            <input
              type="range"
              min={0.25}
              max={2}
              step={0.25}
              value={sim.speedMul}
              onChange={(e) =>
                setSim((s) => ({ ...s, speedMul: parseFloat(e.target.value) }))
              }
              aria-label="trip speed. changes how fast you watch the cars drive, not the latency numbers."
              className="w-24 accent-[var(--accent)] sm:w-28"
            />
            <span className="text-faint">faster</span>
            <span className="tnum normal-case tracking-normal text-ink">
              {Number(sim.speedMul.toFixed(2))}x
            </span>
          </label>
          <span className="font-mono text-[10px] normal-case tracking-normal text-faint">
            how fast you watch, not the numbers
          </span>
          {userActive && (
            <span className="tnum font-mono text-[11px] uppercase tracking-[0.16em] text-flame-deep">
              request on the road…
            </span>
          )}
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
            trouble
          </span>
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
          <span className="ml-auto font-mono text-xs">
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
          </span>
          <span className="tnum font-mono text-xs text-faint">
            incidents fixed: {sim.incidentsFixed}
            {" · "}best:{" "}
            {sim.bestMs != null ? `${sim.bestMs.toFixed(0)}s` : "-"}
          </span>
        </div>
      </div>

      {/* diagram */}
      <div className="mt-3 overflow-x-auto pb-1">
        <div className="relative min-w-[900px]">
          <svg
            viewBox="0 0 1560 1080"
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
                fill={FAINT}
                className="font-mono"
                style={{ letterSpacing: "0.2em" }}
              >
                {label.toUpperCase()}
              </text>
            ))}
            {/* kubernetes boundary around the services column */}
            <g aria-hidden="true">
              <rect
                x={760}
                y={50}
                width={210}
                height={912}
                fill="none"
                stroke={INK}
                strokeWidth={1.25}
                strokeDasharray="8 6"
                opacity={0.35}
                rx={10}
              />
            </g>
            <text
              x={375}
              y={948}
              textAnchor="middle"
              fontSize={11}
              fill={FAINT}
              className="font-mono"
              style={{ letterSpacing: "0.2em" }}
              aria-hidden="true"
            >
              DELIVERY
            </text>
            <text
              x={1075}
              y={948}
              textAnchor="middle"
              fontSize={11}
              fill={FAINT}
              className="font-mono"
              style={{ letterSpacing: "0.2em" }}
              aria-hidden="true"
            >
              OBSERVABILITY
            </text>
            {ROADS.map((r) => (
              <path
                key={r.id}
                ref={registerRoad(r.id)}
                d={r.d}
                fill="none"
                stroke={INK}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeDasharray={r.ambient ? "6 5" : undefined}
                opacity={r.ambient ? 0.28 : 0.5}
              />
            ))}
            {/* ambient traffic: full round trips, dimmer and slower */}
            {sim.ambient.map((v) => {
              const p = locate(v.pts, v.cum, v.dist);
              return (
                <TripVehicle
                  key={v.id}
                  trip={v}
                  x={p.x}
                  y={p.y}
                  ang={p.ang}
                  reduceMotion={reduceMotion}
                />
              );
            })}
            {/* the visitor's requests: accent car out, green car back */}
            {sim.trips.map((t) => {
              const p = locate(t.pts, t.cum, t.dist);
              return (
                <g key={t.id}>
                  {t.pulse && t.processLeft > 0 && (
                    <g aria-hidden="true">
                      {[0, 1, 2].map((k) => {
                        const age = t.processAge - k * 260;
                        if (age < 0) return null;
                        const r = 12 + age / 22;
                        const o = Math.max(0, 0.55 - age / 1100);
                        return (
                          <circle
                            key={k}
                            cx={t.pulse!.x}
                            cy={t.pulse!.y}
                            r={r.toFixed(1)}
                            fill="none"
                            stroke="var(--accent)"
                            strokeWidth={1.5}
                            opacity={o.toFixed(2)}
                          />
                        );
                      })}
                    </g>
                  )}
                  <TripVehicle
                    trip={t}
                    x={p.x}
                    y={p.y}
                    ang={p.ang}
                    reduceMotion={reduceMotion}
                  />
                </g>
              );
            })}
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
      <p className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[11px] text-faint">
        <span className="sm:hidden">
          → scroll sideways to see the whole system. tap a node to read its
          story.
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-2 w-2 bg-flame" />
          outbound
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2"
            style={{ background: RETURN_GREEN }}
          />
          return
        </span>
      </p>

      {/* response card */}
      <div ref={responseRef} className="mt-3 min-h-[104px] scroll-mt-24 border-y border-ink/70 py-3">
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
            {userActive
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
