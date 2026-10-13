# portfolio

Jerin Jack's personal portfolio site. Dark, typography-led, built around one idea: the request trace.

## Stack

Vite + React + TypeScript + Tailwind CSS v4 + Framer Motion.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build (tsc + vite)
npm run preview  # serve the production build
```

## Design

- **Motif:** a live, animated request-trace visualization in the hero (HTTP method tags, latency bars, ticking p50/p99 numbers). Hover any row to inspect it. Static when the user prefers reduced motion.
- **Theme:** near-black control room (`#0A0A0E`) with a subtle blueprint-grid texture, one amber accent (`#F5A524`) used sparingly.
- **Type:** Space Grotesk (display), Inter (body), JetBrains Mono (engineering details).
- **Sections:** sticky nav, hero, about (with stats), experience timeline, projects + AI Lab strip, skills, education, contact, footer.

## Content rules

Every fact on the site traces to the build brief in `~/workspace/portfolio/MASTER_PROMPT.md`. Never invent employers, dates, metrics, skills, or degrees. Location is shown only as "United States | Open to Relocation". No addresses, visa status, salary, or ID numbers anywhere.
