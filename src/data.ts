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
    ],
    children: [
      {
        id: "iota-reporting",
        label: "reporting queries, tuned",
        story: "High-read reporting operations, tuned with targeted indexing.",
        details: [
          "Optimized high-read reporting operations through query tuning and targeted indexing.",
          "Service-layer validations and application logging to improve reliability.",
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
  version: string;
  company: string;
  role: string;
  dates: string;
  location: string;
  bullets: string[];
}

export const experience: ExperienceEntry[] = [
  {
    version: "v4.2",
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
    version: "v3.0",
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
    version: "v2.0",
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
    version: "v1.0",
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

export const aiLab = [
  {
    name: "QueryLens",
    status: "w.i.p.",
    description:
      "Paste a slow query, get indexing and rewrite suggestions with plain-English explanations.",
  },
  {
    name: "DocuChat",
    status: "w.i.p.",
    description:
      "Upload a PDF, ask questions, get answers grounded in the document with cited page numbers.",
  },
  {
    name: "TicketTriage",
    status: "w.i.p.",
    description:
      "Paste a support ticket, get urgency and topic classification plus a drafted first response.",
  },
];

export const skillGroups: { name: string; items: string }[] = [
  { name: "Languages", items: "Java 8/11/17, SQL, TypeScript" },
  {
    name: "Backend & Frameworks",
    items:
      "Spring Boot, Spring MVC, Spring Data, Spring Security, Hibernate and JPA, REST API Design, Microservices Architecture, gRPC, SOLID Principles, OOP",
  },
  {
    name: "Architecture",
    items:
      "Microservices, Event Driven Systems, API Design, Design Patterns, Caching Strategies, Fault Tolerance",
  },
  {
    name: "Databases",
    items:
      "Oracle (PL/SQL, query tuning), PostgreSQL, MySQL, MongoDB, Redis, Indexing, Query Optimization, Transactions",
  },
  {
    name: "Messaging & Streaming",
    items: "Apache Kafka, JMS, asynchronous processing",
  },
  {
    name: "Cloud & DevOps",
    items:
      "AWS (ECS, SDKs), Azure, Docker, Kubernetes, Jenkins, GitHub Actions, CI/CD, Linux and Unix, Maven, Gradle, Git, Tomcat, Shell Scripting",
  },
  { name: "Security", items: "OAuth2, JWT, TLS, Role Based Access Control" },
  { name: "Testing", items: "JUnit, Mockito, Postman, SonarQube" },
  {
    name: "AI Tools",
    items:
      "AI coding assistants (code generation, test scaffolding, documentation); daily Claude Code / Cursor-style agent-loop coding (3 years)",
  },
  { name: "Frontend", items: "Angular 8, HTML5, CSS3, TypeScript" },
  {
    name: "Practices",
    items: "Agile and Scrum, Jira, Code Reviews, Technical Documentation",
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

export const about = {
  paragraphs: [
    "I'm Jerin Jack, a software engineer with 4+ years building the parts of software users never see but always feel: APIs, microservices, data pipelines. Most of my work has been Java and Spring Boot, with a lot of time spent making databases behave. Oracle and PostgreSQL tuning, Redis caching, Kafka event flows. I use AI coding agents daily and they make me faster, not lazier.",
    "At Gulf International Bank, peak-time payment APIs got nearly 50% faster after a round of query and index work. At AVPS Technologies I shipped 12+ production endpoints and kept a zero-defect record over the past year. I like the unglamorous problems: the slow endpoint, the flaky deploy, the report that takes ten seconds.",
  ],
  stats: [
    { value: "4+", label: "years experience" },
    { value: "12+", label: "production endpoints shipped" },
    { value: "~50%", label: "peak API latency cut" },
    { value: "0", label: "prod defects in the last year" },
  ],
};
