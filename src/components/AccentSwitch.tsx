import { useEffect, useState } from "react";
import {
  ACCENTS,
  getAccentId,
  setAccentId,
  subscribeAccent,
} from "../accent";

export default function AccentSwitch() {
  // Single source of truth lives in ../accent; this component only mirrors it.
  const [current, setCurrent] = useState<string>(() => getAccentId());

  useEffect(() => subscribeAccent(setCurrent), []);

  return (
    <div
      className="flex items-center gap-1.5"
      role="group"
      aria-label="accent color"
    >
      <span className="mr-0.5 hidden font-mono text-[11px] uppercase tracking-[0.16em] text-faint sm:inline">
        accent
      </span>
      {ACCENTS.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => setAccentId(a.id)}
          aria-label={`accent: ${a.label}`}
          aria-pressed={current === a.id}
          title={a.label}
          className={`h-4 w-4 border transition-transform hover:-translate-y-px ${
            current === a.id
              ? "border-ink ring-1 ring-ink ring-offset-2 ring-offset-paper"
              : "border-ink/40"
          }`}
          style={{ backgroundColor: a.accent }}
        />
      ))}
    </div>
  );
}
