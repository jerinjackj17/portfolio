import { useEffect, useState } from "react";
import { navLinks, profile } from "../data";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-ink/85 backdrop-blur-md border-b border-line" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="font-mono text-lg font-semibold tracking-tight text-fog">
          jj<span className="text-amber-glow">_</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-dim transition-colors hover:text-fog"
            >
              {link.label}
            </a>
          ))}
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-amber-glow/60 px-4 py-1.5 text-sm font-semibold text-amber-glow transition-colors hover:bg-amber-glow hover:text-ink"
          >
            Resume
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-md text-fog md:hidden"
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-full bg-current transition-transform duration-300 ${
                open ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-0.5 w-full bg-current transition-opacity duration-300 ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[14px] h-0.5 w-full bg-current transition-transform duration-300 ${
                open ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-ink/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1 px-5 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-base font-medium text-dim transition-colors hover:bg-panel hover:text-fog"
              >
                {link.label}
              </a>
            ))}
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="mt-2 rounded-md border border-amber-glow/60 px-4 py-2.5 text-center text-base font-semibold text-amber-glow"
            >
              Resume
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
