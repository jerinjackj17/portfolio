import { useEffect, useState } from "react";
import { getThemeMode, setThemeMode, subscribeTheme } from "../theme";

export default function ThemeSwitch() {
  // Single source of truth lives in ../theme; this component only mirrors it.
  const [mode, setMode] = useState<string>(() => getThemeMode());

  useEffect(() => subscribeTheme(setMode), []);

  const dark = mode === "dark";

  return (
    <button
      type="button"
      onClick={() => setThemeMode(dark ? "light" : "dark")}
      aria-label={dark ? "switch to light theme" : "switch to dark theme"}
      aria-pressed={dark}
      title={dark ? "light theme" : "dark theme"}
      className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-faint transition-colors hover:text-ink"
    >
      <span aria-hidden="true" className="text-sm leading-none">
        {dark ? "☀" : "☾"}
      </span>
      <span className="hidden sm:inline">{dark ? "light" : "dark"}</span>
    </button>
  );
}
