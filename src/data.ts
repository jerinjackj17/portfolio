/* All content traces to MASTER_PROMPT.md Section 1. No invented facts. */

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
  eyebrow: "Software Engineer, Java · Spring Boot · Kafka",
  heading: "I build backend systems that stay fast under pressure.",
  sub: "I'm Jerin Jack. 4+ years designing microservices, tuning databases, and shipping production APIs for banking, education, and enterprise platforms.",
  availability: "Open to relocation, anywhere in the US",
};

export const about = {
  paragraphs: [
    "I'm Jerin Jack, a software engineer with 4+ years building the parts of software users never see but always feel: APIs, microservices, data pipelines. Most of my work has been Java and Spring Boot, with a lot of time spent making databases behave: Oracle and PostgreSQL tuning, Redis caching, Kafka event flows. I use AI coding agents daily and they make me faster, not lazier.",
    "At Gulf International Bank, peak-time payment APIs got nearly 50% faster after a round of query and index work. At AVPS Technologies I shipped 12+ production endpoints and kept a zero-defect record over the past year. I like the unglamorous problems: the slow endpoint, the flaky deploy, the report that takes ten seconds.",
  ],
  stats: [
    { value: "4+", label: "years experience" },
    { value: "12+", label: "production endpoints shipped" },
    { value: "~50%", label: "peak API latency cut" },
    { value: "0", label: "prod defects in the last year" },
  ],
};

export interface ExperienceRole {
  company: string;
  role: string;
  dates: string;
  location: string;
  bullets: string[];
}

export const experience: ExperienceRole[] = [
  {
    company: "AVPS Technologies Inc",
    role: "Software Engineer",
    dates: "Jul 2026 to Present",
    location: "Alpharetta, GA",
    bullets: [
      "Designed and built 12+ production REST endpoints as Java 8/17 Spring Boot microservices for the company's content and analytics platform, with a controller-service-repository layout and reusable DTOs.",
      "Cut response times 25% on high-traffic endpoints by fixing a Hibernate mapping issue, adding missing database indexes, and tuning SQL across Oracle and PostgreSQL.",
      "Built Kafka and JMS async processing for audit events and workflow notifications, which reduced coupling between services and improved fault isolation.",
      "Mentored two junior developers and held the line on engineering standards through code reviews, while keeping zero production defects over the past year.",
    ],
  },
  {
    company: "Chicago Education Advocacy Cooperative",
    role: "Software Engineer",
    dates: "Aug 2025 to Jul 2026",
    location: "Chicago, IL",
    bullets: [
      "Built Java 17 Spring Boot services with reusable DTO contracts for the organization's content and internal operations tools.",
      "Took a recurring reporting query from several seconds to under a second by rewriting a bad join and adding targeted indexes.",
      "Replaced synchronous service calls with Kafka-based async processing for audit events and workflow updates.",
      "Wrote unit and integration tests with JUnit, Mockito, and Postman, and raised SonarQube coverage ahead of releases.",
    ],
  },
  {
    company: "Gulf International Bank (via TCS)",
    role: "Backend Developer",
    dates: "Oct 2021 to Jul 2023",
    location: "Chennai, India",
    bullets: [
      "Built core backend services for a regulated banking client: balance transfers, international payments, account lookups, and reconciliation, in Java and Spring Boot.",
      "Cut peak-time payment API response times by nearly 50% with Oracle and PL/SQL query tuning, index work, transaction management, and Redis caching.",
      "Built Apache Spark batch jobs and ETL pipelines for nightly reconciliation and reporting, feeding Tableau dashboards.",
      "Secured service-to-service calls with OAuth2 and JWT, and integrated partner APIs through WSO2 API Manager with JMS and Kafka event flows.",
    ],
  },
  {
    company: "Iota Automation Private Limited",
    role: "Java Developer",
    dates: "Apr 2020 to Jul 2021",
    location: "Chennai, India",
    bullets: [
      "Built REST APIs and backend services for internal enterprise apps with Java and Spring Boot on Oracle and MySQL.",
      "Sped up high-read reporting operations through query tuning and targeted indexing.",
      "Applied SOLID principles and patterns like DTOs, the repository pattern, and centralized exception handling to keep the code maintainable.",
      "Wrote unit and service-level tests with JUnit and Mockito, and validated APIs with Postman.",
    ],
  },
];

export interface Project {
  title: string;
  description: string[];
  stack: string[];
  codeUrl: string;
}

export const projects: Project[] = [
  {
    title: "AI Powered Document Processing Platform",
    description: [
      "A Spring Boot service that automates invoice, ID, and contract processing with AI-based text extraction and NLP classification models.",
      "Kafka-based async job queuing with results stored in MongoDB and Oracle by document type. REST APIs for upload, status tracking, and result retrieval, with unit and integration tests and SonarQube quality gates.",
    ],
    stack: ["Java", "Spring Boot", "Kafka", "MongoDB", "Oracle"],
    codeUrl: profile.github,
  },
  {
    title: "Vehicle Reservation Microservice and Angular Front End",
    description: [
      "An end-to-end vehicle reservation platform with a Java and Spring Boot backend and Angular 8 front end for search, booking, and an admin dashboard.",
      "GIS-based location mapping and Azure IoT Hub and Event Hub telemetry for live booking updates. JWT auth with role-based access control, deployed with Docker and Kubernetes through Jenkins CI/CD.",
    ],
    stack: ["Java", "Spring Boot", "Angular 8", "Azure IoT Hub", "Docker", "Kubernetes"],
    codeUrl: profile.github,
  },
  {
    title: "Real Time Analytics and ETL Reporting Pipeline",
    description: [
      "A Kafka and Apache Spark streaming pipeline into Oracle reporting tables for real-time business reporting.",
      "ETL jobs that clean, transform, and load multi-source data, publishing operational dashboards in Tableau.",
    ],
    stack: ["Kafka", "Apache Spark", "Oracle", "Tableau"],
    codeUrl: profile.github,
  },
];

export const aiLab = [
  {
    name: "QueryLens",
    tagline: "AI SQL performance coach",
    description:
      "Paste a slow query, get indexing and rewrite suggestions with plain-English explanations. Now building.",
  },
  {
    name: "DocuChat",
    tagline: "Chat with your PDFs",
    description:
      "Upload a PDF, ask questions, get answers grounded in the document with cited page numbers. Now building.",
  },
  {
    name: "TicketTriage",
    tagline: "AI support-ticket classifier",
    description:
      "Paste a support ticket, get urgency and topic classification plus a drafted first response. Now building.",
  },
];

export interface SkillGroup {
  group: string;
  items: string;
}

export const skills: SkillGroup[] = [
  { group: "Languages", items: "Java 8/11/17, SQL, TypeScript" },
  {
    group: "Backend & Frameworks",
    items:
      "Spring Boot, Spring MVC, Spring Data, Spring Security, Hibernate and JPA, REST API Design, Microservices Architecture, gRPC, SOLID Principles, OOP",
  },
  {
    group: "Architecture",
    items:
      "Microservices, Event Driven Systems, API Design, Design Patterns, Caching Strategies, Fault Tolerance",
  },
  {
    group: "Databases",
    items:
      "Oracle (PL/SQL, query tuning), PostgreSQL, MySQL, MongoDB, Redis, Indexing, Query Optimization, Transactions",
  },
  { group: "Messaging & Streaming", items: "Apache Kafka, JMS, asynchronous processing" },
  {
    group: "Cloud & DevOps",
    items:
      "AWS (ECS, SDKs), Azure, Docker, Kubernetes, Jenkins, GitHub Actions, CI/CD, Linux and Unix, Maven, Gradle, Git, Tomcat, Shell Scripting",
  },
  { group: "Security", items: "OAuth2, JWT, TLS, Role Based Access Control" },
  { group: "Testing", items: "JUnit, Mockito, Postman, SonarQube" },
  {
    group: "AI Tools",
    items:
      "AI coding assistants (code generation, test scaffolding, documentation); daily Claude Code / Cursor-style agent-loop coding (3 years)",
  },
  { group: "Frontend", items: "Angular 8, HTML5, CSS3, TypeScript" },
  { group: "Practices", items: "Agile and Scrum, Jira, Code Reviews, Technical Documentation" },
];

export const education = [
  {
    degree: "M.S. Information Technology and Management",
    school: "Illinois Institute of Technology",
    location: "Chicago, IL",
    detail: "GPA 3.9/4.0",
    dates: "Aug 2023 to May 2025",
  },
  {
    degree: "B.E. Electrical and Electronics Engineering",
    school: "Anna University",
    location: "Chennai, India",
    detail: "GPA 3.4",
    dates: "Aug 2017 to 2021",
  },
];

export const contact = {
  heading: "Get in touch",
  pitch: "Have a backend role, or a slow API that needs a second pair of eyes? My inbox is open.",
};

export const footer = {
  line: "Designed and built by Jerin Jack · © 2026",
};
