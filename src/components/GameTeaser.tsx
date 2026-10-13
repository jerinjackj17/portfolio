import { useEffect, useRef, useState } from "react";
import SlowQueryGame from "./SlowQueryGame";

/* Hero teaser for "catch the slow query": a compact card that opens the
   full, unchanged game in an overlay. The hero layout never shifts. */

const BEST_KEY = "jj-sqg-best";

function readBest(): number {
  try {
    return Number(window.localStorage.getItem(BEST_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

export default function GameTeaser() {
  const [open, setOpen] = useState(false);
  const [best, setBest] = useState(readBest);
  const playRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Overlay lifecycle: ESC dismisses, body scroll locks, focus returns to PLAY.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      setBest(readBest());
      playRef.current?.focus();
    };
  }, [open ]);

  return (
    <>
      <div className="border border-ink/70 bg-paper p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
          catch the slow query
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-ink/80">
          Click the slow ones (over 500ms) before 3 slip past. A fast one
          costs 50 points.
        </p>
        <div className="tnum mt-3 flex select-none items-center gap-2 font-mono text-[11px]">
          <span className="border border-ink/60 bg-paper px-2 py-1 text-ink">
            GET /search · 1400ms
          </span>
          <span className="border border-flame bg-paper px-2 py-1 text-flame-deep">
            too slow →
          </span>
          <span className="border border-ink/60 bg-paper px-2 py-1 text-ink">
            GET /health · 12ms
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="tnum font-mono text-[11px] text-faint">
            best {best}
          </p>
          <button
            ref={playRef}
            type="button"
            onClick={() => setOpen(true)}
            className="border border-ink bg-ink px-5 py-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-paper transition-opacity hover:opacity-85"
          >
            play →
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="catch the slow query game"
        >
          <button
            type="button"
            aria-label="close game"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-ink/25"
            tabIndex={-1}
          />
          <div className="relative max-h-[92vh] w-full max-w-[560px] overflow-y-auto border border-ink/70 bg-paper p-4 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
                the on-call arcade
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="close game"
                className="border border-ink/60 px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:border-ink"
              >
                ✕ close
              </button>
            </div>
            <SlowQueryGame />
          </div>
        </div>
      )}
    </>
  );
}
