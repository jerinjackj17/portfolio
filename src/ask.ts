/* Ask engine: answers questions about Jerin from a structured copy of his
   profile, and scores pasted job descriptions against it.
   Everything runs in the browser. No LLM, no server, nothing leaves the page.
   Facts come from src/data.ts and the master brief only. Nothing invented:
   unknown topics get an honest "not in his profile" instead of a guess. */

import { education, experience, profile, projects, skillGroups } from "./data";

export interface Answer {
  text: string;
  sources: string[];
}

/* ---------------- snippet retrieval (fallback) ---------------- */

interface Snippet {
  id: string;
  source: string;
  text: string;
}

const snippets: Snippet[] = [
  {
    id: "summary",
    source: "about",
    text: "Jerin Jack is a software engineer with 4+ years building backend systems: Java and Spring Boot microservices, Kafka event flows, and databases tuned until they behave. He works with AI coding agents daily.",
  },
  ...experience.map<Snippet>((e) => ({
    id: `exp-${e.company}`,
    source: `experience · ${e.company}`,
    text: `${e.company}, ${e.role} (${e.dates}). ${e.bullets.join(" ")}`,
  })),
  ...projects.map<Snippet>((p) => ({
    id: `proj-${p.index}`,
    source: `projects · ${p.title}`,
    text: `${p.title}. ${p.description.join(" ")} Stack: ${p.stack}.`,
  })),
  ...skillGroups.map<Snippet>((g) => ({
    id: `skill-${g.name}`,
    source: `skills · ${g.name}`,
    text: `${g.name}: ${g.items}. Used at: ${g.usedAt}.`,
  })),
  ...education.map<Snippet>((e) => ({
    id: `edu-${e.school}`,
    source: "education",
    text: `${e.degree}, ${e.school}. ${e.detail}. ${e.dates}.`,
  })),
  {
    id: "ailab",
    source: "ai lab",
    text: "His AI Lab has four live demos: flowforge (durable agent workflows on LangGraph with checkpoints, retries, and a human approval gate), mcp-baremetal (a Model Context Protocol server written by hand with scoped credentials and PII masking), verifiable-rag (a retrieval pipeline that critiques its own hits and abstains when grounding is thin), and fileforge (a free file converter that runs entirely in the browser: drop a file on a circle, pick an output format, download it). Links are in the AI Lab section above.",
  },
  {
    id: "location",
    source: "about",
    text: `He is based in the ${profile.location}. Email is the fastest way to reach him: ${profile.email}.`,
  },
];

const STOP = new Set(
  "the a an is are was were be been in on at to for of and or with by he his him it its as from that this these those did does do what where when which who whom how why i me my we our you your they them their there here had has have not no yes if then than so such can could would should will just about into over after before tell".split(
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

function retrieve(query: string): Snippet | null {
  const q = tokens(query);
  if (q.length === 0) return null;
  let best: Snippet | null = null;
  let bestScore = 0;
  for (const sn of snippets) {
    const c = new Set(tokens(sn.text));
    let hit = 0;
    for (const t of q) if (c.has(t)) hit++;
    const score = hit / q.length;
    if (score > bestScore) {
      bestScore = score;
      best = sn;
    }
  }
  return bestScore >= 0.34 ? best : null;
}

/* ---------------- intent answers ---------------- */

const has = (q: string, ...words: string[]) =>
  words.some((w) => q.includes(w));

function intentAnswer(raw: string): Answer | null {
  const q = raw.toLowerCase();

  if (/^(hi|hello|hey|yo)\b/.test(q.trim())) {
    return {
      text: "Hi. Ask me anything about Jerin's work: his backend experience, the bank payment speedup, his Kafka work, his skills, or paste a job description in the fit checker and I will score it against his profile.",
      sources: [],
    };
  }
  if (has(q, "salary", "compensation", "pay range", "rate")) {
    return {
      text: "I do not discuss compensation here. For anything like that, email Jerin directly and he will talk numbers with you.",
      sources: ["contact"],
    };
  }
  if (has(q, "visa", "sponsor", "work authorization", "work permit", "citizen")) {
    return {
      text: "That is a conversation for Jerin himself, not a website widget. Email him and ask directly.",
      sources: ["contact"],
    };
  }
  if (has(q, "contact", "email", "reach", "phone")) {
    return {
      text: `Email is the way: ${profile.email}. He is also on LinkedIn (linkedin.com/in/jerinjackj) and GitHub (github.com/jerinjackj17).`,
      sources: ["contact"],
    };
  }
  if (has(q, "relocat", "located", "where is he", "based")) {
    return {
      text: "He is based in the United States and open to relocation anywhere in the US.",
      sources: ["about"],
    };
  }
  if (has(q, "kafka", "event driven", "event-driven", "messaging", "jms")) {
    return {
      text: "Kafka is core to his recent work. At AVPS Technologies he moved audit events and workflow notifications onto Kafka and JMS, replacing synchronous calls so services fail independently. He did the same at the Chicago Education Advocacy Cooperative for audit events and workflow updates, and used Kafka and JMS event flows at Gulf International Bank too.",
      sources: ["experience · AVPS Technologies Inc", "experience · Chicago Education Advocacy Cooperative"],
    };
  }
  if (has(q, "kubernetes", "k8s", "docker", "container")) {
    return {
      text: "Docker and Kubernetes are in his regular toolkit: services containerized with Docker and deployed to AWS ECS at AVPS, Docker through Jenkins pipelines at the bank, and Kubernetes in his project work. His Cloud and DevOps skill group covers Docker, Kubernetes, Jenkins, GitHub Actions, and CI/CD end to end.",
      sources: ["skills · Cloud & DevOps", "experience · AVPS Technologies Inc"],
    };
  }
  if (has(q, "database", "sql", "oracle", "postgres", "mysql", "tuning", "slow quer")) {
    return {
      text: "Databases are his signature. At Gulf International Bank he cut peak-time payment API response times by nearly 50% with Oracle and PL/SQL tuning, index work, transaction management, and Redis caching. At the Chicago Education Advocacy Cooperative he took a reporting query from several seconds to under a second by rewriting a join and adding targeted indexes. At AVPS he fixed a Hibernate mapping issue and missing indexes for a 25% gain on high-traffic endpoints.",
      sources: ["experience · Gulf International Bank (via TCS)", "experience · Chicago Education Advocacy Cooperative"],
    };
  }
  if (has(q, "java", "spring")) {
    return {
      text: "Java and Spring Boot are home turf: 4+ years across four employers, currently Java 8/17 Spring Boot microservices at AVPS Technologies with a controller, service, repository architecture and reusable DTOs. Spring MVC, Spring Data, Spring Security, Hibernate and JPA are all in his daily stack.",
      sources: ["skills · Backend & Frameworks", "experience · AVPS Technologies Inc"],
    };
  }
  if (has(q, "python")) {
    return {
      text: "Python is in his language list and it is what his AI demos are built with: flowforge and verifiable-rag both run Python backends (FastAPI). His production day job is Java, Python is his second language.",
      sources: ["skills · Languages", "ai lab"],
    };
  }
  if (has(q, "react", "angular", "frontend", "front end", "front-end")) {
    return {
      text: "He can work the front end but backend is home. He integrated backend services with an Angular front end at AVPS, built an Angular 8 front end earlier in his career, and the demos on this site run React and TypeScript. If the role is 80% UI work, he is not your strongest candidate. If it is a Java backend with some front end attached, he is.",
      sources: ["skills · Frontend"],
    };
  }
  if (has(q, "ai", "llm", "rag", "agent", "machine learning", "ml")) {
    return {
      text: "Two layers here. At work he uses AI coding agents daily for boilerplate, test scaffolding, and documentation, three years of that workflow. On his own time he builds applied AI: flowforge (durable agent workflows with a cost kill-switch), mcp-baremetal (a hand-written MCP server), and verifiable-rag (RAG that critiques its own retrieval and abstains instead of hallucinating), and fileforge (a free client-side file converter). All four are live in the AI Lab section. He is not an ML researcher and will tell you so himself.",
      sources: ["ai lab", "skills · AI Tools"],
    };
  }
  if (has(q, "education", "degree", "university", "college", "masters", "master's", "gpa")) {
    return {
      text: "M.S. in Information Technology and Management from Illinois Institute of Technology, Chicago, GPA 3.9/4.0 (2023 to 2025). Before that, a B.E. in Electrical and Electronics Engineering from Anna University, Chennai.",
      sources: ["education"],
    };
  }
  if (has(q, "bank", "gulf", "payment")) {
    return {
      text: "At Gulf International Bank (through TCS, 2021 to 2023) he built core banking services: balance transfers, international payments, account lookups, reconciliation. The headline result: peak-time payment API response times cut by nearly 50% through query tuning, indexing, transaction management, and Redis caching. He also ran Spark ETL for nightly reconciliation and implemented OAuth2 and JWT auth.",
      sources: ["experience · Gulf International Bank (via TCS)"],
    };
  }
  if (has(q, "avps", "current", "now", "latest")) {
    return {
      text: "Currently at AVPS Technologies as a software engineer. He designed and shipped 12+ production REST endpoints as Spring Boot microservices, improved high-traffic endpoint response times by 25%, moved audit and notification flows onto Kafka and JMS, and mentors two junior developers. Zero production defects over the past year.",
      sources: ["experience · AVPS Technologies Inc"],
    };
  }
  if (has(q, "experience", "years", "background", "career", "worked")) {
    return {
      text: "4+ years, four stops. Java developer at Iota Automation (2020 to 2021), backend developer for Gulf International Bank via TCS (2021 to 2023), a master's at Illinois Tech in between, software engineer at the Chicago Education Advocacy Cooperative (2025 to 2026), and now AVPS Technologies. The thread through all of it: Java, Spring Boot, and making slow systems fast.",
      sources: ["experience"],
    };
  }
  if (has(q, "strength", "best at", "good at", "why hire", "why should")) {
    return {
      text: "His proof points, not adjectives: payment APIs at a regulated bank cut nearly 50% at peak; a reporting query taken from seconds to under a second; 12+ production endpoints shipped with zero defects in a year; Kafka event flows replacing brittle synchronous calls at two employers; two junior developers mentored. If your problem is a backend that is slow, coupled, or flaky, that is exactly his track record.",
      sources: ["about", "experience"],
    };
  }
  if (has(q, "weakness", "gap", "not good", "lacking")) {
    return {
      text: "Honest version: his depth is the Java backend. Front end is working level, not his lead skill. Languages outside Java, Python, and TypeScript are not in his production history, and he builds applied AI rather than training models. Everything else on this page, he can back up with shipped work.",
      sources: ["skills"],
    };
  }
  if (has(q, "project", "built", "portfolio", "demo")) {
    return {
      text: "Three production stories anchor the Projects section: the bank payment speedup, the AVPS endpoint platform, and the reporting query rescue. Separately, his AI Lab has four live demos you can click and break: flowforge, mcp-baremetal, verifiable-rag, and fileforge. Scroll up for links.",
      sources: ["projects", "ai lab"],
    };
  }
  if (has(q, "available", "start", "notice", "interview")) {
    return {
      text: `For availability and timelines, email him at ${profile.email}. He reads it himself.`,
      sources: ["contact"],
    };
  }
  if (has(q, "suitable", "fit", "qualif", "match")) {
    return {
      text: "Short answer for a Java backend role: yes, that is his core. For a precise answer, paste the job description into the fit checker on this page. It compares the JD's requirements against his actual skills and work history, shows the strengths it found, and names the gaps honestly.",
      sources: ["fit checker"],
    };
  }
  return null;
}

export function answerQuestion(raw: string): Answer {
  const intent = intentAnswer(raw);
  if (intent) return intent;
  const hit = retrieve(raw);
  if (hit) return { text: hit.text, sources: [hit.source] };
  return {
    text: "That is not something I can answer from his profile, and I would rather say so than guess. Try asking about his experience, the bank payment work, Kafka, databases, his education, or his AI projects. Or paste a job description into the fit checker.",
    sources: [],
  };
}

/* ---------------- JD fit checker ---------------- */

type Level = "strong" | "working" | "adjacent" | "none";

interface LexEntry {
  term: string;
  match: RegExp;
  level: Level;
  evidence: string;
}

const LEX: LexEntry[] = [
  { term: "Java", match: /\bjava\b(?!script)/i, level: "strong", evidence: "4+ years, every role since 2020" },
  { term: "Spring Boot", match: /spring boot/i, level: "strong", evidence: "his primary framework at all four employers" },
  { term: "Spring", match: /\bspring\b/i, level: "strong", evidence: "Spring MVC, Data, Security in daily use" },
  { term: "Kafka", match: /kafka/i, level: "strong", evidence: "async audit and notification flows at AVPS and Chicago Edu" },
  { term: "Microservices", match: /micro[-\s]?services/i, level: "strong", evidence: "12+ production endpoints as Spring Boot microservices" },
  { term: "REST APIs", match: /\brest/i, level: "strong", evidence: "API design and production endpoints across banking and ed-tech" },
  { term: "SQL", match: /\bsql\b/i, level: "strong", evidence: "query tuning is his signature skill" },
  { term: "Oracle", match: /oracle|pl\/?sql/i, level: "strong", evidence: "PL/SQL tuning at a regulated bank" },
  { term: "PostgreSQL", match: /postgres/i, level: "strong", evidence: "schema design and indexing for analytics workloads" },
  { term: "MySQL", match: /mysql/i, level: "strong", evidence: "production use at Iota Automation" },
  { term: "MongoDB", match: /mongo/i, level: "strong", evidence: "listed in his database stack" },
  { term: "Redis", match: /redis/i, level: "strong", evidence: "caching in front of the hottest bank read paths" },
  { term: "Hibernate / JPA", match: /hibernate|\bjpa\b/i, level: "strong", evidence: "fixed a Hibernate mapping issue for a 25% endpoint gain" },
  { term: "Docker", match: /docker/i, level: "strong", evidence: "containerized deploys at AVPS and the bank" },
  { term: "Kubernetes", match: /kubernetes|\bk8s\b/i, level: "strong", evidence: "in his Cloud and DevOps stack, project deploys on K8s" },
  { term: "AWS", match: /\baws\b|amazon web services|elastic container|\becs\b/i, level: "strong", evidence: "services deployed to AWS ECS" },
  { term: "Azure", match: /azure/i, level: "strong", evidence: "Azure SDKs and IoT/Event Hub work" },
  { term: "CI/CD", match: /ci\/cd|continuous integration|continuous delivery/i, level: "strong", evidence: "Jenkins and GitHub Actions pipelines he maintains" },
  { term: "Jenkins", match: /jenkins/i, level: "strong", evidence: "CI/CD pipelines at AVPS and Gulf" },
  { term: "GitHub Actions", match: /github actions/i, level: "strong", evidence: "pipelines at AVPS and Chicago Edu" },
  { term: "Maven", match: /maven/i, level: "strong", evidence: "daily build tool" },
  { term: "Gradle", match: /gradle/i, level: "strong", evidence: "in his build tool stack" },
  { term: "Git", match: /\bgit\b/i, level: "strong", evidence: "daily" },
  { term: "Linux", match: /linux|unix/i, level: "strong", evidence: "production deploys and shell scripting since 2020" },
  { term: "OAuth2 / JWT", match: /oauth|\bjwt\b/i, level: "strong", evidence: "implemented for bank service-to-service auth" },
  { term: "JUnit / Mockito", match: /junit|mockito/i, level: "strong", evidence: "unit and integration tests in every role" },
  { term: "Apache Spark", match: /\bspark\b/i, level: "strong", evidence: "nightly reconciliation ETL at the bank" },
  { term: "ETL", match: /\betl\b/i, level: "strong", evidence: "multi-source pipelines feeding Tableau dashboards" },
  { term: "Agile / Scrum", match: /agile|scrum/i, level: "strong", evidence: "sprint teams in every role, Jira daily" },
  { term: "Event-driven architecture", match: /event[-\s]driven/i, level: "strong", evidence: "Kafka flows replacing synchronous calls at two employers" },
  { term: "Python", match: /python/i, level: "working", evidence: "second language; his AI demos run Python and FastAPI" },
  { term: "TypeScript", match: /typescript/i, level: "working", evidence: "this site and his demos are TypeScript" },
  { term: "Angular", match: /angular/i, level: "working", evidence: "front end integration at AVPS, Angular 8 earlier" },
  { term: "React", match: /\breact\b/i, level: "working", evidence: "his live demos run React" },
  { term: "gRPC", match: /grpc/i, level: "working", evidence: "in his backend skill set" },
  { term: "LLMs / RAG", match: /\bllm\b|large language|retrieval[-\s]augmented|\brag\b|langchain|langgraph/i, level: "working", evidence: "three live applied-AI demos, including a self-correcting RAG" },
  { term: "GCP", match: /\bgcp\b|google cloud/i, level: "adjacent", evidence: "his cloud depth is AWS and Azure; concepts transfer, GCP specifics would be new" },
  { term: "Terraform", match: /terraform/i, level: "adjacent", evidence: "he ships containers and pipelines; Terraform itself is not in his listed stack" },
  { term: "GraphQL", match: /graphql/i, level: "none", evidence: "not in his profile; his API work is REST" },
  { term: "Go", match: /\bgolang\b|\bgo\b(?=\s+(?:developer|engineer|programming|language))/i, level: "none", evidence: "not in his production history" },
  { term: "Rust", match: /\brust\b/i, level: "none", evidence: "not in his production history" },
  { term: "Node.js", match: /node\.?js/i, level: "none", evidence: "not in his production history; his backend is JVM" },
  { term: "C# / .NET", match: /c#|\.net/i, level: "none", evidence: "not in his production history" },
  { term: "Machine learning (model training)", match: /machine learning|deep learning|\bml\b/i, level: "adjacent", evidence: "he builds applied AI products, not model training pipelines" },
];

export interface JdResult {
  verdict: string;
  pct: number;
  strengths: { term: string; evidence: string }[];
  gaps: { term: string; note: string }[];
  notes: string[];
  found: number;
}

const LEVEL_SCORE: Record<Level, number> = {
  strong: 1,
  working: 0.75,
  adjacent: 0.4,
  none: 0,
};

export function analyzeJd(jd: string): JdResult | { error: string } {
  const words = jd.trim().split(/\s+/).filter(Boolean).length;
  if (words < 40) {
    return {
      error:
        "That looks short for a job description. Paste the full posting, requirements and all, and I will score it properly.",
    };
  }

  const hits = LEX.filter((e) => e.match.test(jd));
  // Spring Boot also triggers Spring; keep both, it is honest.
  if (hits.length === 0) {
    return {
      error:
        "I could not find any technologies from his world in that text. If this JD is for a Java backend role, paste the requirements section too.",
    };
  }

  const total = hits.reduce((acc, h) => acc + LEVEL_SCORE[h.level], 0);
  const pct = Math.round((total / hits.length) * 100);

  const strengths = hits
    .filter((h) => h.level === "strong" || h.level === "working")
    .slice(0, 8)
    .map((h) => ({ term: h.term, evidence: h.evidence }));
  const gaps = hits
    .filter((h) => h.level === "adjacent" || h.level === "none")
    .map((h) => ({
      term: h.term,
      note:
        h.level === "adjacent"
          ? h.evidence
          : `no production history with ${h.term}; he would be learning it on the job`,
    }));

  const notes: string[] = [];
  const yearsMatch = jd.match(/(\d+)\+?\s*(?:years|yrs)/i);
  if (yearsMatch) {
    const req = parseInt(yearsMatch[1], 10);
    if (req > 4) {
      notes.push(
        `The JD asks for ${req}+ years. Jerin has 4+ years, with senior-scope proof: performance work at a regulated bank, mentoring, a zero-defect year.`,
      );
    } else {
      notes.push(`Experience bar (${req}+ years) is met: he has 4+ years.`);
    }
  }
  if (/senior|staff|principal|lead/i.test(jd)) {
    notes.push(
      "The JD pitches senior scope. His evidence: led the bank payment performance work, mentors two juniors, owns endpoints end to end.",
    );
  }
  if (/bank|fintech|payments?|financial/i.test(jd)) {
    notes.push(
      "Domain match: he spent nearly two years building for a regulated bank, payments included.",
    );
  }

  const verdict =
    pct >= 75
      ? "Strong fit. The core of this JD is his daily work."
      : pct >= 50
        ? "Good fit, with a few honest gaps."
        : pct >= 30
          ? "Partial fit. Worth a conversation only if the gaps are trainable."
          : "Weak fit on paper. His depth sits elsewhere.";

  return { verdict, pct, strengths, gaps, notes, found: hits.length };
}
