import { contact, profile } from "../data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

export default function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading index="06" title={contact.heading} />

        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-lg leading-relaxed text-dim md:text-xl">{contact.pitch}</p>

            <a
              href={`mailto:${profile.email}`}
              className="mt-9 inline-block rounded-lg bg-amber-glow px-8 py-4 font-display text-lg font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5 md:text-xl"
            >
              {profile.email}
            </a>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              <a
                href={`tel:${profile.phone.replace(/[^+\d]/g, "")}`}
                className="font-mono text-sm text-dim transition-colors hover:text-amber-glow"
              >
                {profile.phone}
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                aria-label="Jerin Jack on GitHub"
                className="text-dim transition-colors hover:text-amber-glow"
              >
                <GitHubIcon className="h-6 w-6" />
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="Jerin Jack on LinkedIn"
                className="text-dim transition-colors hover:text-amber-glow"
              >
                <LinkedInIcon className="h-6 w-6" />
              </a>
            </div>

            <p className="mt-6 font-mono text-sm text-faint">{profile.location}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
