import { profile } from "../data";
import SectionHeader from "./SectionHeader";
import MessageForm from "./MessageForm";

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-20 md:px-8 md:pt-28">
      <SectionHeader title="Contact" />
      <h3 className="mt-8 max-w-2xl font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-6xl">
        Have a slow API?
      </h3>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/85">
        Have a backend role, or a slow endpoint that needs a second pair of eyes?
        My inbox is open. Or scroll back up and send a request. It comes back
        200 OK.
      </p>
      <div className="mt-8 border-t border-ink/70">
        <a
          href={`mailto:${profile.email}`}
          className="u-link tnum block border-b border-rule py-4 font-display text-2xl font-medium tracking-tight text-ink md:text-3xl"
        >
          {profile.email}
        </a>
        <div className="flex flex-col gap-1 border-b border-rule py-4 font-mono text-sm text-smoke md:flex-row md:items-center md:gap-8">
          <a href={profile.github} target="_blank" rel="noreferrer" className="u-link w-fit">
            github →
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="u-link w-fit">
            linkedin →
          </a>
        </div>
      </div>
      <MessageForm />
    </section>
  );
}
