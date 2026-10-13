import { useEffect, useState } from "react";
import AccentSwitch from "./AccentSwitch";

function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/views")
      .then((r) => (r.ok ? r.json() : { count: null }))
      .then((d) => {
        if (alive && typeof d.count === "number") setCount(d.count);
      })
      .catch(() => {
        /* counter unavailable: show the dash */
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <span className="tnum">
      visits · {count == null ? "-" : count.toLocaleString("en-US")}
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="mx-auto max-w-5xl px-5 pb-10 pt-20 md:px-8">
      <div className="flex flex-col gap-3 border-t border-ink pt-5 font-mono text-xs text-faint md:flex-row md:items-center md:justify-between">
        <p>Set in Alfa Slab One &amp; Inter. No dashboards were harmed.</p>
        <div className="flex items-center gap-5">
          <VisitCounter />
          <AccentSwitch />
          <p className="tnum">© 2026 Jerin Jack</p>
        </div>
      </div>
    </footer>
  );
}
