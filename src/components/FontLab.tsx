import { useState } from "react";

/**
 * TEMPORARY PREVIEW-ONLY PANEL - DO NOT SHIP TO PRODUCTION.
 * Lets Jerin compare the three heading-font finalists live by swapping
 * the --font-display CSS variable. Strip this component (and its import in
 * App.tsx) before merging to main.
 */

const FONTS = [
  { id: "alfa", label: "Alfa Slab One", stack: '"Alfa Slab One", "Georgia", serif' },
  { id: "bitter", label: "Bitter", stack: '"Bitter", "Georgia", serif' },
  { id: "rokkitt", label: "Rokkitt", stack: '"Rokkitt", "Georgia", serif' },
];

export default function FontLab() {
  const [current, setCurrent] = useState("alfa");

  const pick = (id: string) => {
    const f = FONTS.find((x) => x.id === id);
    if (!f) return;
    setCurrent(id);
    document.documentElement.style.setProperty("--font-display", f.stack);
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 border border-ink bg-paper px-3 py-2 shadow-[4px_4px_0_0_rgba(26,24,21,0.15)]"
      role="group"
      aria-label="font lab, preview only"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-flame-deep">
        font lab · preview only
      </p>
      <div className="mt-1.5 flex gap-1.5">
        {FONTS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => pick(f.id)}
            aria-pressed={current === f.id}
            className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
              current === f.id
                ? "border-ink bg-ink text-paper"
                : "border-ink/40 text-ink hover:bg-ink hover:text-paper"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
