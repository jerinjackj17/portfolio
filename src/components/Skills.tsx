import { skills } from "../data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Skills() {
  return (
    <section id="skills" className="scroll-mt-24 border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          index="04"
          title="Skills"
          blurb="The toolkit I reach for in production. Grouped by where each one actually gets used."
        />

        <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group, i) => (
            <Reveal key={group.group} delay={Math.min(i * 0.04, 0.24)} className="bg-panel">
              <div className="h-full p-6">
                <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-amber-glow">
                  {group.group}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-dim">{group.items}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
