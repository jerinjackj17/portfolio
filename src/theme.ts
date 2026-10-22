/* Single source of truth for the light/dark theme.
   ThemeSwitch (nav) reads and writes here. Persists to
   localStorage ("jj-theme") and syncs across tabs via the storage event.
   The actual palette lives in index.css: utilities resolve through the
   --color-* variables, and a `.dark` block on <html> overrides them.
   index.html carries a tiny inline script that applies the saved mode
   before first paint, so there is no flash of the wrong theme. */

export type ThemeMode = "light" | "dark";

const KEY = "jj-theme";

type Listener = (mode: ThemeMode) => void;
const listeners = new Set<Listener>();

function systemDefault(): ThemeMode {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

function apply(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", mode === "dark");
}

function read(): ThemeMode {
  let saved: string | null = null;
  try {
    saved = window.localStorage.getItem(KEY);
  } catch {
    saved = null;
  }
  return saved === "dark" || saved === "light" ? saved : systemDefault();
}

/** Current mode; applies the <html> class as a side effect. Idempotent. */
export function getThemeMode(): ThemeMode {
  const mode = read();
  apply(mode);
  return mode;
}

/** Set the mode everywhere: <html> class, storage, all subscribers. */
export function setThemeMode(mode: ThemeMode): void {
  apply(mode);
  try {
    window.localStorage.setItem(KEY, mode);
  } catch {
    /* storage unavailable; in-memory state still syncs this tab */
  }
  for (const fn of listeners) fn(mode);
}

/** Subscribe to mode changes. Returns an unsubscribe function. */
export function subscribeTheme(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY && (e.newValue === "dark" || e.newValue === "light")) {
      setThemeMode(e.newValue);
    }
  });
}
