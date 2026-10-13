import { motion, useReducedMotion } from "framer-motion";
import SectionHeader from "./SectionHeader";

interface LabProject {
  index: string;
  title: string;
  blurb: string;
  stack: string;
  demo: string;
  repo: string;
}

const labProjects: LabProject[] = [
  {
    index: "01",
    title: "flowforge",
    blurb:
      "Durable agent workflows on LangGraph. Invoices travel a DAG with Redis checkpoints, exponential retries on flaky payments, a human approval gate over $10k, and a cost kill-switch that degrades frontier to cache instead of burning money.",
    stack: "LangGraph · FastAPI · Redis · React",
    demo: "https://flowforge-tan-xi.vercel.app",
    repo: "https://github.com/jerinjackj17/flowforge",
  },
  {
    index: "02",
    title: "mcp-baremetal",
    blurb:
      "A Model Context Protocol server written by hand, no wrapper SDK. Five tools over a sample store with scoped bearer credentials, a PII masking proxy with an audit log, and a SQL guardrail that rejects anything but SELECT.",
    stack: "Python · JSON-RPC 2.0 · SQLite · React",
    demo: "https://mcp-baremetal.vercel.app",
    repo: "https://github.com/jerinjackj17/mcp-baremetal",
  },
  {
    index: "03",
    title: "verifiable-rag",
    blurb:
      "A retrieval pipeline that critiques its own hits, rewrites weak queries once, and abstains when grounding is thin. Demoed side by side against naive RAG so you can watch the naive one hallucinate.",
    stack: "Python · FastAPI · TF-IDF · React",
    demo: "https://verifiable-rag-rho.vercel.app",
    repo: "https://github.com/jerinjackj17/verifiable-rag",
  },
];

export default function AiLab() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="ai-lab"
      className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-24 md:px-8 md:pt-36"
    >
      <SectionHeader title="AI Lab" />
      <p className="mt-4 font-mono text-xs text-faint">
        live demos. click through and break them.
      </p>

      <div className="mt-6 border-t border-ink/70">
        {labProjects.map((p, i) => (
          <motion.article
            key={p.index}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="border-b border-rule py-6"
          >
            <div className="flex items-baseline gap-4">
              <span className="tnum shrink-0 font-mono text-sm text-flame-deep">
                {p.index}
              </span>
              <h3 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-[1.7rem]">
                {p.title}
              </h3>
            </div>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink/90">
              {p.blurb}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-xs text-smoke">{p.stack}</p>
              <div className="flex items-center gap-5">
                <a
                  href={p.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="u-link font-mono text-xs uppercase tracking-[0.16em] text-ink"
                >
                  code →
                </a>
                <a
                  href={p.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="u-link font-mono text-xs uppercase tracking-[0.16em] text-flame-deep"
                >
                  live demo →
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
