import { useEffect, useState } from "react";
import { navLinks, profile } from "../data";
import AccentSwitch from "./AccentSwitch";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-paper transition-shadow ${
        scrolled ? "border-b border-rule" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <a
          href="#top"
          className="font-display text-lg font-semibold tracking-tight text-ink"
        >
          Jerin&nbsp;Jack
        </a>
        <div className="flex items-center gap-5 overflow-x-auto font-mono text-[11px] uppercase tracking-[0.16em] text-smoke">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="u-link whitespace-nowrap">
              {l.label}
            </a>
          ))}
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="u-link whitespace-nowrap text-ink"
          >
            Resume&nbsp;→
          </a>
        </div>
        <div className="hidden shrink-0 items-center border-l border-rule pl-5 sm:flex">
          <AccentSwitch />
        </div>
      </nav>
    </header>
  );
}
