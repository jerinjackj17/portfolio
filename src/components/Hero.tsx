import { hero } from "../data";
import SystemPlayground from "./SystemPlayground";
import SlowQueryGame from "./SlowQueryGame";

export default function Hero() {
  return (
    <section
      id="top"
      className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-14 md:px-8 md:pt-20"
    >
      <div className="md:grid md:grid-cols-[1fr_340px] md:items-start md:gap-10">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-smoke">
            {hero.eyebrow}
          </p>
          <h1 className="mt-5 font-display text-[17vw] font-semibold leading-[0.95] tracking-tight text-ink sm:text-7xl md:text-7xl">
            {hero.name}
          </h1>
          <p className="mt-6 max-w-2xl font-display text-3xl font-medium italic leading-tight text-ink md:text-4xl">
            {hero.headline}
          </p>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/85">
            {hero.sub}
          </p>
          <p className="tnum mt-6 font-mono text-xs uppercase tracking-[0.2em] text-faint">
            {hero.meta}
          </p>
        </div>
        <div className="mt-10 md:mt-2">
          <SlowQueryGame />
        </div>
      </div>

      <div className="mt-12 md:mt-16">
        <SystemPlayground />
      </div>
    </section>
  );
}
