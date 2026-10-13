import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ragDocs, ragSuggestions } from "../data";
import SectionHeader from "./SectionHeader";

/* ---------- chunking ---------- */

interface Chunk {
  id: number;
  docId: string;
  docTitle: string;
  text: string;
}

function sentencesOf(text: string): string[] {
  const m = text.match(/[^.!?]+[.!?]+/g);
  return (m ?? [text]).map((s) => s.trim()).filter(Boolean);
}

function chunkDocs(size: number, overlap: boolean): Chunk[] {
  const chunks: Chunk[] = [];
  let id = 1;
  for (const doc of ragDocs) {
    const sents = sentencesOf(doc.text);
    const stride = overlap ? Math.max(1, size - 1) : size;
    for (let i = 0; i < sents.length; i += stride) {
      const piece = sents.slice(i, i + size).join(" ");
      if (!piece) continue;
      chunks.push({ id: id++, docId: doc.id, docTitle: doc.title, text: piece });
      if (i + stride >= sents.length) break;
    }
  }
  return chunks;
}

/* ---------- scoring: plain keyword overlap, honest and deterministic ---------- */

const STOP = new Set(
  "the a an is are was were be been in on at to for of and or with by he his him it its as from that this these those did does do what where when which who whom how why i me my we our you your they them their there here had has have not no yes if then than so such can could would should will just about into over after before".split(
    " ",
  ),
);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map((t) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t));
}

function scoreChunk(query: string, text: string): number {
  const q = tokens(query);
  if (q.length === 0) return 0;
  const c = new Set(tokens(text));
  let hit = 0;
  for (const t of q) if (c.has(t)) hit++;
  return hit / q.length;
}

/* ---------- stages ---------- */

const STAGES = [
  { id: "chunk", label: "chunk", sub: "split the text into numbered pieces" },
  { id: "embed", label: "embed", sub: "turn each piece into numbers" },
  { id: "retrieve", label: "retrieve", sub: "find the pieces closest to your question" },
  { id: "generate", label: "generate", sub: "write an answer from the best pieces" },
] as const;

type StageId = (typeof STAGES)[number]["id"] | "idle" | "done";

export default function AiPlayground() {
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState(2);
  const [overlap, setOverlap] = useState(false);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<StageId>("idle");
  const [scores, setScores] = useState<Record<number, number>>({});
  const [topIds, setTopIds] = useState<number[]>([]);
  const [answer, setAnswer] = useState("");
  const [answerDone, setAnswerDone] = useState(false);
  const timers = useRef<number[]>([]);

  const chunks = useMemo(() => chunkDocs(size, overlap), [size, overlap]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  useEffect(() => {
    timers.current.forEach((t) => {
      window.clearTimeout(t);
      window.clearInterval(t);
    });
    timers.current = [];
    setScores({});
    setTopIds([]);
    setAnswer("");
    setAnswerDone(false);
    setStage("idle");
  }, [size, overlap]);

  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, reduceMotion ? 0 : ms));
  };

  const ask = (q: string) => {
    const question = q.trim();
    if (!question) return;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setScores({});
    setTopIds([]);
    setAnswer("");
    setAnswerDone(false);

    setStage("chunk");
    later(350, () => {
      setStage("embed");
      later(800, () => {
        const scored = chunks.map((c) => ({
          id: c.id,
          s: Math.round(scoreChunk(question, c.text) * 100) / 100,
        }));
        const byScore = [...scored].sort((a, b) => b.s - a.s || a.id - b.id);
        const top = byScore.filter((x) => x.s > 0).slice(0, 3);
        const scoreMap: Record<number, number> = {};
        scored.forEach((x) => (scoreMap[x.id] = x.s));
        setScores(scoreMap);
        setTopIds(top.map((x) => x.id));
        setStage("retrieve");
        later(900, () => {
          setStage("generate");
          const best = top[0] ? chunks.find((c) => c.id === top[0].id) : null;
          if (!best) {
            setAnswer(`Nothing in the docs matches that. Try one of the suggested questions.`);
            setAnswerDone(true);
            setStage("done");
            return;
          }
          let text = `The docs say: "${best.text}" [${best.id}].`;
          const second = top[1] && top[1].s >= 0.3 ? chunks.find((c) => c.id === top[1].id) : null;
          if (second) text += ` Also: "${second.text}" [${second.id}].`;
          if (reduceMotion) {
            setAnswer(text);
            setAnswerDone(true);
            setStage("done");
            return;
          }
          let i = 0;
          const typeId = window.setInterval(() => {
            i += 3;
            setAnswer(text.slice(0, i));
            if (i >= text.length) {
              window.clearInterval(typeId);
              setAnswerDone(true);
              setStage("done");
            }
          }, 18);
          timers.current.push(typeId);
        });
      });
    });
  };

  const stageIndex = (s: StageId) =>
    s === "idle" ? -1 : s === "done" ? STAGES.length : STAGES.findIndex((x) => x.id === s);

  return (
    <section
      id="ask"
      className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-20 md:px-8 md:pt-28"
    >
      <SectionHeader title="Ask the machine" />
      <p className="mt-4 font-mono text-xs text-faint">
        a toy search over three short docs about my work. you run the pipeline.
      </p>

      {/* stages */}
      <div className="mt-6 flex flex-wrap items-stretch gap-2">
        {STAGES.map((st, i) => {
          const lit = stageIndex(stage) >= i;
          const running = stage === st.id;
          return (
            <div key={st.id} className="flex items-stretch gap-2">
              {i > 0 && (
                <span aria-hidden="true" className="self-center font-mono text-faint">
                  →
                </span>
              )}
              <div
                className={`border px-3 py-2 ${
                  running
                    ? "border-flame bg-flame text-paper"
                    : lit
                      ? "border-flame-deep text-flame-deep"
                      : "border-rule text-faint"
                }`}
              >
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em]">
                  {st.label}
                </p>
                <p
                  className={`mt-0.5 font-mono text-[10px] ${
                    running ? "text-paper/80" : "text-faint"
                  }`}
                >
                  {st.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
        {/* docs + chunks */}
        <div>
          <div className="flex flex-wrap items-center gap-5">
            <div>
              <label
                htmlFor="ai-chunksize"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke"
              >
                sentences per chunk ·{" "}
                <span className="tnum text-ink">{size}</span>
              </label>
              <input
                id="ai-chunksize"
                type="range"
                min={1}
                max={4}
                step={1}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="mt-2 block w-48 max-w-full accent-[#E8491D]"
              />
            </div>
            <button
              type="button"
              onClick={() => setOverlap((o) => !o)}
              aria-pressed={overlap}
              className="u-link mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-smoke"
            >
              overlap: {overlap ? "on" : "off"}
            </button>
          </div>

          <div className="mt-5 space-y-6">
            {ragDocs.map((doc) => (
              <div key={doc.id}>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
                  {doc.title}
                </p>
                <div className="mt-2 space-y-2">
                  {chunks
                    .filter((c) => c.docId === doc.id)
                    .map((c) => {
                      const isTop = topIds.includes(c.id);
                      const sc = scores[c.id];
                      return (
                        <div
                          key={c.id}
                          className={`border px-3 py-2.5 transition-colors ${
                            isTop
                              ? "border-flame-deep bg-warm-1/40"
                              : stage === "embed"
                                ? "border-flame-deep/50 bg-cool-1"
                                : "border-rule"
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <span
                              className={`font-mono text-[11px] ${
                                isTop ? "text-flame-deep" : "text-faint"
                              }`}
                            >
                              chunk #{c.id}
                            </span>
                            {sc !== undefined && (
                              <span
                                className={`tnum font-mono text-[11px] ${
                                  isTop ? "font-medium text-flame-deep" : "text-faint"
                                }`}
                              >
                                {sc.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[14px] leading-relaxed text-ink/90">
                            {c.text}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* query + answer */}
        <div>
          <label
            htmlFor="ai-query"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke"
          >
            ask a question
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="ai-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") ask(query);
              }}
              placeholder="e.g. where did he use Kafka?"
              className="w-full border border-ink/70 bg-paper px-3 py-2.5 font-mono text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-flame"
            />
            <button
              type="button"
              onClick={() => ask(query)}
              className="shrink-0 border border-ink bg-ink px-5 font-mono text-xs font-medium uppercase tracking-[0.16em] text-paper hover:opacity-85"
            >
              ask
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {ragSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuery(s);
                  ask(s);
                }}
                className="u-link text-left font-mono text-[11px] text-smoke"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-6 min-h-[120px] border-y border-ink/70 py-4">
            {answer ? (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-flame-deep">
                  answer
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink">
                  {answer}
                  {!answerDone && (
                    <span aria-hidden="true" className="text-flame-deep">
                      ▍
                    </span>
                  )}
                </p>
              </motion.div>
            ) : (
              <p className="font-mono text-sm text-faint">
                {stage === "idle"
                  ? "type a question or tap a suggestion. the pipeline runs live."
                  : "working…"}
              </p>
            )}
          </div>

          <p className="mt-4 font-mono text-[11px] leading-relaxed text-faint">
            a toy model of the real pipeline. simulated in your browser, no
            vector DB, no LLM calls.
          </p>
        </div>
      </div>
    </section>
  );
}
