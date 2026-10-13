import { skillGroups } from "../data";
import SectionHeader from "./SectionHeader";

export default function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-20 md:px-8 md:pt-28">
      <SectionHeader index="04" title="Skills" />
      <p className="mt-4 font-mono text-xs text-faint">appendix a · the full index.</p>
      <dl className="mt-6 grid gap-x-12 md:grid-cols-2">
        {skillGroups.map((g) => (
          <div key={g.name} className="border-t border-rule py-4">
            <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-flame-deep">
              {g.name}
            </dt>
            <dd className="mt-2 text-[15px] leading-relaxed text-ink/90">{g.items}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
