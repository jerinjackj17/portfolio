import { useEffect, useState } from "react";
import { footer, profile } from "../data";

function LocalTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        }),
      );
    };
    update();
    const id = window.setInterval(update, 30000);
    return () => window.clearInterval(id);
  }, []);

  return <span className="tabular-nums">{time}</span>;
}

export default function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 font-mono text-sm text-faint md:flex-row md:px-8">
        <p>{footer.line}</p>
        <p>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-amber-glow"
          >
            github
          </a>
          <span className="mx-3" aria-hidden="true">
            ·
          </span>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-amber-glow"
          >
            linkedin
          </a>
          <span className="mx-3" aria-hidden="true">
            ·
          </span>
          local time <LocalTime />
        </p>
      </div>
    </footer>
  );
}
