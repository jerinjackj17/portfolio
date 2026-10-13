import { useEffect, useState } from "react";

interface Accent {
  id: string;
  label: string;
  accent: string;
  deep: string;
}

const ACCENTS: Accent[] = [
  { id: "flame", label: "flame", accent: "#E8491D", deep: "#B23A12" },
  { id: "blue", label: "blue", accent: "#2456C8", deep: "#1A41A0" },
  { id: "green", label: "green", accent: "#2E7D32", deep: "#1F6B2A" },
  { id: "amber", label: "amber", accent: "#C77414", deep: "#9A5A0C" },
];

const KEY = "jj-accent";

function apply(a: Accent) {
  const root = document.documentElement;
  root.style.setProperty("--accent", a.accent);
  root.style.setProperty("--accent-deep", a.deep);
}

export default function AccentSwitch() {
  const [current, setCurrent] = useState<string>("flame");

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    const found = ACCENTS.find((a) => a.id === saved) ?? ACCENTS[0];
    setCurrent(found.id);
    apply(found);
  }, []);

  const pick = (a: Accent) => {
    setCurrent(a.id);
    apply(a);
    window.localStorage.setItem(KEY, a.id);
  };

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
          onClick={() => pick(a)}
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
