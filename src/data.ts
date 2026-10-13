export const profile = {
  name: "Jerin Jack",
  title: "Software Engineer",
  email: "jerinjack28@gmail.com",
  phone: "312-918-9649",
  github: "https://github.com/jerinjackj17",
  linkedin: "https://linkedin.com/in/jerinjackj",
  location: "United States | Open to Relocation",
};

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Ask", href: "#ask" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export const hero = {
  eyebrow: "software engineer · java · spring boot · kafka",
  name: "Jerin Jack",
  headline: "I find the hot frames.",
  sub: "The slow queries, the flaky deploys, the report that takes ten seconds. I cool them down.",
  meta: "United States | Open to Relocation",
};

/* ------------------------------------------------------------------ */
/* Flame graph: a profiler report on a career.                         */
/* Top-row widths are proportional to real durations (months).         */
/* Child frames are the stories worth zooming into, sized for reading. */
/* ------------------------------------------------------------------ */

export interface HotFrame {
  id: string;
  label: string;
  story: string;
  details: string[];
  /** width as % of the parent frame */
  widthPct: number;
  /** left offset as % of the parent frame */
  offsetPct: number;
  heat: 1 | 2 | 3;
}

export interface CareerFrame {
  id: string;
  label: string;
  dates: string;
  /** months since Apr 2020 */
  start: number;
  end: number;
  heat: 0 | 1;
  story: string;
  details: string[];
  children: HotFrame[];
}

export const TIMELINE_START = 0; // Apr 2020
export const TIMELINE_END = 78; // Oct 2026

export const careerFrames: CareerFrame[] = [
  {
    id: "iota",
    label: "Iota Automation",
    dates: "Apr 2020 → Jul 2021",
    start: 0,
    end: 15,
    heat: 0,
    story: "Java developer. First production systems, first slow queries.",
    details: [
      "Developed REST APIs and backend services for internal enterprise applications with Java and Spring Boot on Oracle and MySQL.",
      "Applied SOLID principles and design patterns (DTOs, repository pattern, centralized exception handling).",
      "Optimized high-read reporting operations through query tuning and targeted indexing.",
      "Supported production deployments on Linux and Unix, including Tomcat configuration and shell scripting.",
    ],
    children: [
      {
        id: "iota-reporting",
        label: "reporting queries, tuned",
        story: "High-read reporting operations, tuned with targeted indexing.",
        details: [
          "Optimized high-read reporting operations through query tuning and targeted indexing.",
          "Service-layer validations and application logging to improve reliability.",
          "Validated APIs with Postman.",
        ],
        widthPct: 62,
        offsetPct: 19,
        heat: 1,
      },
    ],
  },
  {
    id: "gulf",
    label: "Gulf Intl Bank · TCS",
    dates: "Oct 2021 → Jul 2023",
    start: 18,
    end: 39,
    heat: 0,
    story: "Backend developer for a regulated bank. The hottest frame of the career.",
    details: [
      "Built core backend services for a regulated banking client: balance transfers, international payments, account lookups, reconciliation.",
      "Reduced peak-time payment API response times by nearly 50% through Oracle and PL/SQL query tuning, index optimization, transaction management, and Redis caching.",
      "Developed Apache Spark batch jobs and ETL pipelines for nightly reconciliation, feeding Tableau dashboards.",
      "Mentored junior developers; implemented OAuth2 and JWT-based authentication.",
    ],
    children: [
      {
        id: "gulf-payments",
        label: "payment API, peak: cut ~50%",
        story: "Peak-time payment APIs, nearly 50% faster. The frame this whole site is about.",
        details: [
          "Reduced peak-time payment API response times by nearly 50%.",
          "Oracle and PL/SQL query tuning, index optimization, transaction management.",
          "Redis caching in front of the hottest read paths.",
          "Mentored junior developers on the team.",
        ],
        widthPct: 68,
        offsetPct: 16,
        heat: 3,
      },
    ],
  },
  {
    id: "iit",
    label: "Illinois Tech",
    dates: "Aug 2023 → May 2025",
    start: 40,
    end: 61,
    heat: 0,
    story: "M.S. Information Technology and Management, Chicago. 3.9/4.0.",
    details: [
      "M.S. Information Technology and Management, Illinois Institute of Technology, Chicago, IL.",
      "GPA 3.9/4.0.",
    ],
    children: [
      {
        id: "iit-degree",
        label: "M.S. IT & Management · 3.9",
        story: "Master's degree, Illinois Institute of Technology.",
        details: [
          "M.S. Information Technology and Management.",
          "Illinois Institute of Technology, Chicago, IL. GPA 3.9/4.0.",
        ],
        widthPct: 72,
        offsetPct: 14,
        heat: 1,
      },
    ],
  },
  {
    id: "ceac",
    label: "Chicago Edu Coop",
    dates: "Aug 2025 → Jul 2026",
    start: 64,
    end: 75,
    heat: 0,
    story: "Software engineer. A reporting query went from seconds to under a second.",
    details: [
      "Developed Java 17 Spring Boot services for the organization's content and internal operations tools.",
      "Reduced a recurring reporting query from several seconds to under a second by rewriting an inefficient join and adding targeted indexes.",
      "Implemented Kafka-based asynchronous processing for audit events and workflow updates.",
      "Wrote unit and integration tests with JUnit, Mockito, and Postman; raised SonarQube coverage ahead of releases.",
    ],
    children: [
      {
        id: "ceac-query",
        label: "reporting query: seconds → <1s",
        story: "A recurring reporting query, rewritten. Seconds became under a second.",
        details: [
          "Reduced a recurring reporting query from several seconds to under a second.",
          "Rewrote an inefficient join; added targeted indexes.",
          "Designed normalized PostgreSQL schemas with indexing for analytics workloads.",
        ],
        widthPct: 66,
        offsetPct: 17,
        heat: 3,
      },
    ],
  },
  {
    id: "avps",
    label: "AVPS Technologies",
    dates: "Jul 2026 → present",
    start: 75,
    end: 78,
    heat: 1,
    story: "Software engineer. 12+ production endpoints, zero-defect year.",
    details: [
      "Designed and developed 12+ production REST endpoints as Java 8/17 Spring Boot microservices.",
      "Improved response times by 25% on high-traffic endpoints: fixed a Hibernate mapping issue, added missing indexes, optimized SQL across Oracle and PostgreSQL.",
      "Implemented asynchronous processing with Kafka and JMS for audit events and workflow notifications.",
      "Mentored two junior developers. Zero production defects over the past year.",
      "Used AI coding assistants for boilerplate generation, test scaffolding, and documentation.",
    ],
    children: [
      {
        id: "avps-endpoints",
        label: "12+ endpoints · 0 defects",
        story: "Twelve production endpoints shipped. Zero defects in the past year.",
        details: [
          "12+ production REST endpoints as Spring Boot microservices with reusable DTOs.",
          "25% faster on high-traffic endpoints after Hibernate and index work.",
          "Mentored two junior developers; enforced standards through code reviews.",
          "Zero production defects over the past year.",
        ],
        widthPct: 92,
        offsetPct: 4,
        heat: 3,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */

export interface ExperienceEntry {
  company: string;
  role: string;
  dates: string;
  location: string;
  bullets: string[];
}

export const experience: ExperienceEntry[] = [
  {
    company: "AVPS Technologies Inc",
    role: "Software Engineer",
    dates: "Jul 2026 → present",
    location: "Alpharetta, GA",
    bullets: [
      "Designed and developed 12+ production REST endpoints as Java 8/17 Spring Boot microservices with a controller, service, repository architecture and reusable DTOs.",
      "Improved response times by 25% on high-traffic endpoints by fixing a Hibernate mapping issue, adding missing database indexes, and optimizing SQL queries across Oracle and PostgreSQL.",
      "Implemented asynchronous processing with Kafka and JMS for audit events and workflow notifications, reducing coupling between services.",
      "Mentored two junior developers and enforced engineering standards through code reviews. Zero production defects over the past year.",
    ],
  },
  {
    company: "Chicago Education Advocacy Cooperative",
    role: "Software Engineer",
    dates: "Aug 2025 → Jul 2026",
    location: "Chicago, IL",
    bullets: [
      "Reduced a recurring reporting query from several seconds to under a second by rewriting an inefficient join and adding targeted indexes.",
      "Implemented Kafka-based asynchronous processing for audit events and workflow updates, replacing synchronous service calls.",
      "Wrote unit and integration tests with JUnit, Mockito, and Postman; increased SonarQube code coverage ahead of releases.",
      "Diagnosed and resolved Tier 3 production issues using Log4j output and API traces.",
    ],
  },
  {
    company: "Gulf International Bank (via TCS)",
    role: "Backend Developer",
    dates: "Oct 2021 → Jul 2023",
    location: "Chennai, India",
    bullets: [
      "Reduced peak-time payment API response times by nearly 50% through Oracle and PL/SQL query tuning, index optimization, transaction management, and Redis caching.",
      "Built core backend services for a regulated banking client: balance transfers, international payments, account lookups, and reconciliation.",
      "Developed Apache Spark batch jobs and ETL pipelines for nightly reconciliation and business reporting, feeding Tableau dashboards.",
      "Implemented OAuth2 and JWT-based authentication to secure service-to-service communication.",
    ],
  },
  {
    company: "Iota Automation Private Limited",
    role: "Java Developer",
    dates: "Apr 2020 → Jul 2021",
    location: "Chennai, India",
    bullets: [
      "Developed REST APIs and backend services for internal enterprise applications with Java and Spring Boot on Oracle and MySQL.",
      "Applied SOLID principles and design patterns (DTOs, repository pattern, centralized exception handling) to improve code maintainability.",
      "Optimized high-read reporting operations through query tuning and targeted indexing.",
      "Wrote unit and service-level tests with JUnit and Mockito; validated APIs with Postman.",
    ],
  },
];

export interface Project {
  index: string;
  title: string;
  description: string[];
  stack: string;
}

export const projects: Project[] = [
  {
    index: "01",
    title: "AI Powered Document Processing Platform",
    description: [
      "Built a Spring Boot service automating invoice, ID, and contract processing with AI-based text extraction and NLP classification models.",
      "Kafka-based asynchronous job queuing with results stored in MongoDB and Oracle by document type. REST APIs for upload, status tracking, and result retrieval, with unit and integration tests and SonarQube quality gates.",
    ],
    stack: "Spring Boot · Kafka · MongoDB · Oracle · NLP",
  },
  {
    index: "02",
    title: "Vehicle Reservation Microservice",
    description: [
      "Developed an end-to-end vehicle reservation platform with a Java and Spring Boot backend and Angular 8 front end for search, booking, and an admin dashboard.",
      "Integrated GIS-based location mapping and Azure IoT Hub and Event Hub telemetry for live booking updates. Secured with JWT authentication and role-based access control; deployed with Docker and Kubernetes through Jenkins CI/CD.",
    ],
    stack: "Spring Boot · Angular 8 · Azure IoT Hub · JWT · Kubernetes",
  },
  {
    index: "03",
    title: "Real Time Analytics and ETL Reporting Pipeline",
    description: [
      "Built a Kafka and Apache Spark streaming pipeline into Oracle reporting tables for real-time business reporting.",
      "Developed ETL jobs to clean, transform, and load multi-source data, publishing operational dashboards in Tableau.",
    ],
    stack: "Kafka · Apache Spark · Oracle · Tableau",
  },
];

export const skillGroups: { name: string; items: string; usedAt: string }[] = [
  {
    name: "Languages",
    items: "Java 8/11/17, SQL, TypeScript",
    usedAt: "the daily drivers, in every role since 2020",
  },
  {
    name: "Backend & Frameworks",
    items:
      "Spring Boot, Spring MVC, Spring Data, Spring Security, Hibernate and JPA, REST API Design, Microservices Architecture, gRPC, SOLID Principles, OOP",
    usedAt: "Spring Boot microservices at AVPS, the bank, and Chicago Edu",
  },
  {
    name: "Architecture",
    items:
      "Microservices, Event Driven Systems, API Design, Design Patterns, Caching Strategies, Fault Tolerance",
    usedAt: "event-driven design with Kafka at AVPS and Chicago Edu",
  },
  {
    name: "Databases",
    items:
      "Oracle (PL/SQL, query tuning), PostgreSQL, MySQL, MongoDB, Redis, Indexing, Query Optimization, Transactions",
    usedAt: "Oracle tuning at the bank, PostgreSQL at Chicago Edu, Redis in front of hot reads",
  },
  {
    name: "Messaging & Streaming",
    items: "Apache Kafka, JMS, asynchronous processing",
    usedAt: "Kafka audit events and workflow notifications at AVPS and Chicago Edu",
  },
  {
    name: "Cloud & DevOps",
    items:
      "AWS (ECS, SDKs), Azure, Docker, Kubernetes, Jenkins, GitHub Actions, CI/CD, Linux and Unix, Maven, Gradle, Git, Tomcat, Shell Scripting",
    usedAt: "Docker on AWS ECS, Jenkins and GitHub Actions pipelines, Linux deploys",
  },
  {
    name: "Security",
    items: "OAuth2, JWT, TLS, Role Based Access Control",
    usedAt: "OAuth2 and JWT service-to-service auth for the banking client",
  },
  {
    name: "Testing",
    items: "JUnit, Mockito, Postman, SonarQube",
    usedAt: "unit and integration tests with SonarQube quality gates",
  },
  {
    name: "AI Tools",
    items:
      "AI coding assistants (code generation, test scaffolding, documentation); daily Claude Code / Cursor-style agent-loop coding (3 years)",
    usedAt: "daily agent-loop coding: boilerplate, test scaffolding, docs",
  },
  {
    name: "Frontend",
    items: "Angular 8, HTML5, CSS3, TypeScript",
    usedAt: "Angular 8 front end on the vehicle reservation platform",
  },
  {
    name: "Practices",
    items: "Agile and Scrum, Jira, Code Reviews, Technical Documentation",
    usedAt: "Agile sprints, Jira boards, code reviews, mentoring juniors",
  },
];

export const education = [
  {
    degree: "M.S. Information Technology and Management",
    school: "Illinois Institute of Technology, Chicago, IL",
    detail: "GPA 3.9/4.0",
    dates: "Aug 2023 → May 2025",
  },
  {
    degree: "B.E. Electrical and Electronics Engineering",
    school: "Anna University, Chennai, India",
    detail: "GPA 3.4",
    dates: "Aug 2017 → 2021",
  },
];

/* ------------------------------------------------------------------ */
/* System playground: the architecture, live.                         */
/* All stories trace to the master brief §1. Metrics are illustrative */
/* sample traffic for the simulation, labeled as such in the caption. */
/* ------------------------------------------------------------------ */

export interface SystemNode {
  id: string;
  label: string;
  /** one line on what it does */
  role: string;
  /** headline story */
  story: string;
  /** 2-3 bullets, facts from brief §1 only */
  details: string[];
  /** illustrative base traffic for the simulation */
  baseRpm: number;
  baseP50: number;
}

export const systemNodes: SystemNode[] = [
  {
    id: "client",
    label: "client",
    role: "you. pick a request and hit send.",
    story: "Every trip on this map starts with you.",
    details: [
      "Cars are the requests you send from the composer above.",
      "Watch one drive the whole round trip and come back with an answer.",
    ],
    baseRpm: 8200,
    baseP50: 0,
  },
  {
    id: "api-gateway",
    label: "api-gateway",
    role: "spring boot service · java 17. the front door.",
    story: "Every request knocks here first.",
    details: [
      "Routes /payments, /reports and /auth traffic to the right service.",
      "A dozen-plus production endpoints live behind this box.",
      "Dockerized, running on AWS ECS.",
    ],
    baseRpm: 8200,
    baseP50: 12,
  },
  {
    id: "auth-svc",
    label: "auth-svc",
    role: "spring boot service · java 17. proves who you are.",
    story: "Hands out tokens, checks them at the door.",
    details: [
      "OAuth2 and JWT for service-to-service calls.",
      "Built for a regulated bank, where auth is never optional.",
    ],
    baseRpm: 1100,
    baseP50: 24,
  },
  {
    id: "payments-svc",
    label: "payments-svc",
    role: "spring boot service · java 17. moves money, carefully.",
    story: "The busiest box on the map. It used to crawl at peak time.",
    details: [
      "Oracle and PL/SQL tuning, better indexes, tighter transactions.",
      "Redis caching in front of the hottest read paths.",
      "Peak-time responses now land in about half the time.",
    ],
    baseRpm: 2400,
    baseP50: 96,
  },
  {
    id: "reports-svc",
    label: "reports-svc",
    role: "spring boot service · java 17. answers hard questions.",
    story: "The report everyone waited on. Now it finishes fast.",
    details: [
      "A bad join rewritten, indexes added where they mattered.",
      "PostgreSQL schemas shaped for analytics workloads.",
      "Seconds became less than one.",
    ],
    baseRpm: 310,
    baseP50: 180,
  },
  {
    id: "kafka",
    label: "kafka",
    role: "the nervous system. async everything.",
    story: "Events in, events out. Nobody waits on anybody.",
    details: [
      "Audit events and workflow notifications ride this bus.",
      "Replaced synchronous calls that used to chain failures together.",
      "Less coupling between services, calmer nights.",
    ],
    baseRpm: 12000,
    baseP50: 6,
  },
  {
    id: "postgres",
    label: "postgres",
    role: "remembers everything.",
    story: "The source of truth. Tuned until it behaves.",
    details: [
      "Query tuning and indexing across Oracle and PostgreSQL.",
      "Schemas built for reporting workloads.",
    ],
    baseRpm: 3100,
    baseP50: 8,
  },
  {
    id: "redis",
    label: "redis",
    role: "remembers the fast things faster.",
    story: "The shortcut. Hot reads never touch the database.",
    details: [
      "Caching in front of the busiest read paths.",
      "Part of why peak-time payments got twice as fast.",
    ],
    baseRpm: 9400,
    baseP50: 2,
  },
];

export const about = {
  paragraphs: [
    "I'm Jerin Jack. I build the parts of software you never see but always feel: the APIs, the services, the data layer underneath. Java and Spring Boot are home turf, and I have spent an unreasonable amount of time making databases behave. Oracle, PostgreSQL, Redis, Kafka. I work with AI coding agents every day; they make me faster, not lazier.",
    "The work I'm proudest of is unglamorous. At a bank, the payment API that crawled at peak time now runs nearly twice as fast. At an ed-tech nonprofit, the report everyone waited on finishes in under a second. Slow endpoints, flaky deploys, ten-second reports: that is my beat.",
  ],
  stats: [
    { value: "4+", label: "years building backends", num: 4, prefix: "", suffix: "+" },
    { value: "12+", label: "production endpoints shipped", num: 12, prefix: "", suffix: "+" },
    { value: "~50%", label: "peak latency cut", num: 50, prefix: "~", suffix: "%" },
    { value: "0", label: "defects last year", num: 0, prefix: "", suffix: "" },
  ],
};

/* ------------------------------------------------------------------ */
/* AI playground: three short career docs for the simulated RAG toy.  */
/* Fresh copy, facts from the master brief §1 only.                    */
/* ------------------------------------------------------------------ */

export interface RagDoc {
  id: string;
  title: string;
  text: string;
}

export const ragDocs: RagDoc[] = [
  {
    id: "payments",
    title: "the payment speedup",
    text: "At Gulf International Bank, working through TCS, Jerin tuned the payment APIs that slowed down at peak time. Oracle and PL/SQL query tuning, better indexes, tighter transactions, and Redis caching in front of the hottest reads cut peak-time response times by nearly 50%.",
  },
  {
    id: "reporting",
    title: "the ten-second report",
    text: "At the Chicago Education Advocacy Cooperative, a recurring reporting query took several seconds against the PostgreSQL database. Jerin rewrote the inefficient join, added targeted indexes, and normalized the schema. The same report now finishes in under a second.",
  },
  {
    id: "kafka",
    title: "going async",
    text: "At AVPS Technologies, Jerin replaced synchronous service calls with Kafka event flows for audit events and workflow notifications. Less coupling between services, better fault isolation. He mentored two junior developers and kept zero production defects over the past year.",
  },
];

export const ragSuggestions = [
  "where did Jerin cut payment latency?",
  "what database did the reporting fix use?",
  "where did he use Kafka?",
];
