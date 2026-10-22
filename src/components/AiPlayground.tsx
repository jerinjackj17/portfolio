import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { analyzeJd, answerQuestion, type JdResult } from "../ask";
import SectionHeader from "./SectionHeader";

interface Msg {
  role: "you" | "machine";
  text: string;
  sources?: string[];
}

const SUGGESTIONS = [
  "what is he best at?",
  "tell me about the bank payment work",
  "does he know Kafka?",
  "what are his honest gaps?",
  "how do I reach him?",
];

const GREETING: Msg = {
  role: "machine",
  text: "Ask me anything about Jerin's work: experience, skills, the payment speedup at the bank, his AI projects. Or paste a job description into the fit checker and I will compare it against his profile, strengths and gaps both.",
};

export default function AiPlayground() {
  const reduceMotion = useReducedMotion();
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [jd, setJd] = useState("");
  const [jdResult, setJdResult] = useState<JdResult | null>(null);
  const [jdError, setJdError] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  const ask = (q: string) => {
    const question = q.trim();
    if (!question) return;
    const a = answerQuestion(question);
    setMsgs((m) => [
      ...m,
      { role: "you", text: question },
      { role: "machine", text: a.text, sources: a.sources },
    ]);
    setInput("");
  };

  const checkJd = () => {
    const r = analyzeJd(jd);
    if ("error" in r) {
      setJdResult(null);
      setJdError(r.error);
    } else {
      setJdError("");
      setJdResult(r);
    }
  };

  return (
    <section
      id="ask"
      className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-20 md:px-8 md:pt-28"
    >
      <SectionHeader title="Ask about Jerin" />
      <p className="mt-4 font-mono text-xs text-faint">
        questions about my work, answered from my resume. plus a fit checker
        for job descriptions.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
        {/* ---- chat ---- */}
        <div>
          <div
            ref={logRef}
            className="h-[380px] space-y-5 overflow-y-auto border-y border-ink/70 py-5 pr-2"
            aria-live="polite"
          >
            {msgs.map((m, i) => (
              <motion.div
                key={i}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <p
                  className={`font-mono text-[11px] uppercase tracking-[0.18em] ${
                    m.role === "you" ? "text-smoke" : "text-flame-deep"
                  }`}
                >
                  {m.role === "you" ? "you" : "the machine"}
                </p>
                <p
                  className={`mt-1.5 text-[15px] leading-relaxed ${
                    m.role === "you" ? "text-ink/70" : "text-ink"
                  }`}
                >
                  {m.text}
                </p>
                {m.sources && m.sources.length > 0 && (
                  <p className="mt-1.5 font-mono text-[11px] text-faint">
                    from: {m.sources.join(" · ")}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") ask(input);
              }}
              placeholder="e.g. does he know Kubernetes?"
              aria-label="ask a question about Jerin"
              className="w-full border border-ink/70 bg-paper px-3 py-2.5 font-mono text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-flame"
            />
            <button
              type="button"
              onClick={() => ask(input)}
              className="shrink-0 border border-ink bg-ink px-5 font-mono text-xs font-medium uppercase tracking-[0.16em] text-paper hover:opacity-85"
            >
              ask
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="u-link text-left font-mono text-[11px] text-smoke"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ---- JD fit checker ---- */}
        <div className="border border-ink/70 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-flame-deep">
            jd fit checker
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/90">
            Paste a job description. You get a straight answer: is he suitable
            for this role, where is he strong, and where are the gaps.
          </p>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={7}
            placeholder="paste the job description here…"
            aria-label="paste a job description"
            className="mt-4 w-full resize-y border border-rule bg-paper px-3 py-2.5 font-mono text-[13px] leading-relaxed text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-flame"
          />
          <button
            type="button"
            onClick={checkJd}
            className="mt-3 border border-ink bg-ink px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.16em] text-paper hover:opacity-85"
          >
            check fit
          </button>

          {jdError && (
            <p className="mt-4 text-[14px] leading-relaxed text-warn">{jdError}</p>
          )}

          {jdResult && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-5 border-t border-rule pt-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
                  {jdResult.verdict}
                </h3>
                <span className="tnum shrink-0 font-mono text-sm text-flame-deep">
                  {jdResult.pct}%
                </span>
              </div>
              <div
                className="mt-3 h-2 w-full border border-ink/50"
                role="img"
                aria-label={`skill match ${jdResult.pct} percent`}
              >
                <div
                  className="h-full bg-flame"
                  style={{ width: `${jdResult.pct}%` }}
                />
              </div>
              <p className="mt-2 font-mono text-[11px] text-faint">
                matched against {jdResult.found} requirements found in the jd
              </p>

              {jdResult.strengths.length > 0 && (
                <div className="mt-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
                    strengths for this role
                  </p>
                  <ul className="mt-2 space-y-1.5 text-[14px] leading-relaxed text-ink/90">
                    {jdResult.strengths.map((s) => (
                      <li key={s.term}>
                        <span className="font-medium text-ink">{s.term}</span>
                        {" · "}
                        {s.evidence}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {jdResult.gaps.length > 0 && (
                <div className="mt-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
                    honest gaps
                  </p>
                  <ul className="mt-2 space-y-1.5 text-[14px] leading-relaxed text-ink/90">
                    {jdResult.gaps.map((g) => (
                      <li key={g.term}>
                        <span className="font-medium text-ink">{g.term}</span>
                        {" · "}
                        {g.note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {jdResult.notes.map((n) => (
                <p
                  key={n}
                  className="mt-3 text-[14px] leading-relaxed text-ink/90"
                >
                  {n}
                </p>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <p className="mt-6 font-mono text-[11px] leading-relaxed text-faint">
        runs entirely in your browser over a structured copy of my resume. no
        llm, no server, and nothing you paste leaves this page.
      </p>
    </section>
  );
}
