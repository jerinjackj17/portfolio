import { hero } from "../data";
import FlameGraph from "./FlameGraph";

export default function Hero() {
  return (
    <section id="top" className="mx-auto max-w-5xl px-5 pt-14 md:px-8 md:pt-20">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-smoke">
        {hero.eyebrow}
      </p>
      <h1 className="mt-5 font-display text-[17vw] font-medium leading-[0.95] tracking-tight text-ink sm:text-7xl md:text-8xl">
        {hero.name}
      </h1>
      <p className="mt-6 max-w-2xl font-display text-3xl italic leading-tight text-ink md:text-[2.75rem]">
        {hero.headline}
      </p>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/85">{hero.sub}</p>
      <p className="tnum mt-6 font-mono text-xs uppercase tracking-[0.2em] text-faint">
        {hero.meta}
      </p>

      <div className="mt-12 md:mt-16">
        <FlameGraph />
      </div>
    </section>
  );
}
