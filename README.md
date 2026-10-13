# Portfolio v2 — "the profiler"

Complete rebuild of Jerin Jack's portfolio. Concept: **a profiler report on a career** — light editorial paper theme, Fraunces serif display, and a genuine interactive flame graph of his career as the centerpiece.

## Run it

```bash
npm install
npm run dev     # local dev server
npm run build   # production build (tsc + vite)
npm run preview # serve the production build
```

## Design

- Paper `#FAF9F7`, ink `#1A1815`, one flame accent `#E8491D`. Flat colors only, no gradients.
- Fraunces (display) + Inter (body) + JetBrains Mono (annotations).
- Sections divided by hairline rules. No cards, no pills, no glow, no dashboards.
- Centerpiece: `src/components/FlameGraph.tsx` — interactive career flame graph. Top-row widths proportional to real role durations; hot frames for the optimization stories; hover tooltips, click-to-inspect detail strip, lab-notebook figure annotations (`fig. 01`), heat legend, x-axis time ticks.

Build only — not deployed.
