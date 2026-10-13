/* Single source of truth for the visitor accent theme.
   Both AccentSwitch instances (nav + footer) subscribe here, so their
   pressed indicators always agree. Persists to localStorage ("jj-accent")
   and syncs across tabs via the storage event. */

export interface Accent {
  id: string;
  label: string;
  accent: string;
  deep: string;
}

export const ACCENTS: Accent[] = [
  { id: "flame", label: "flame", accent: "#E8491D", deep: "#B23A12" },
  { id: "blue", label: "blue", accent: "#2456C8", deep: "#1A41A0" },
  { id: "green", label: "green", accent: "#2E7D32", deep: "#1F6B2A" },
  { id: "amber", label: "amber", accent: "#C77414", deep: "#9A5A0C" },
];

const KEY = "jj-accent";

type Listener = (id: string) => void;
const listeners = new Set<Listener>();

function find(id: string | null): Accent {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}

function apply(a: Accent) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--accent", a.accent);
  root.style.setProperty("--accent-deep", a.deep);
}

/** Current accent id; applies the CSS variables as a side effect. Idempotent. */
export function getAccentId(): string {
  let saved: string | null = null;
  try {
    saved = window.localStorage.getItem(KEY);
  } catch {
    saved = null;
  }
  const found = find(saved);
  apply(found);
  return found.id;
}

/** Set the accent everywhere: CSS vars, storage, all subscribers. */
export function setAccentId(id: string): void {
  const found = find(id);
  apply(found);
  try {
    window.localStorage.setItem(KEY, found.id);
  } catch {
    /* storage unavailable; in-memory state still syncs this tab */
  }
  for (const fn of listeners) fn(found.id);
}

/** Subscribe to accent changes. Returns an unsubscribe function. */
export function subscribeAccent(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY && e.newValue) setAccentId(e.newValue);
  });
}
