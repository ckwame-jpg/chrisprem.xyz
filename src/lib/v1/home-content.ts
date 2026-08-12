export interface NavSection {
  id: string;
  label: string;
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface ProjectLink {
  href: string;
  label: string;
  type: "demo" | "repo";
}

export interface ProjectItem {
  title: string;
  description: string;
  tags: string[];
  links: ProjectLink[];
}

export interface ExperienceItem {
  period: string;
  title: string;
  description: string;
}

export const sections: NavSection[] = [
  { id: "about", label: "about" },
  { id: "skills", label: "skills" },
  { id: "projects", label: "projects" },
  { id: "playground", label: "playground" },
  { id: "experience", label: "experience" },
];

export const skillCategories: SkillCategory[] = [
  {
    title: "Backend",
    skills: ["Python", "FastAPI", "SQLAlchemy", "REST APIs", "JWT Auth", "WebSockets", "Pydantic"],
  },
  {
    title: "Infrastructure",
    skills: ["Docker", "PostgreSQL", "Redis", "Celery", "Vercel", "Render", "CI/CD"],
  },
  { title: "Frontend", skills: ["TypeScript", "Next.js", "Tailwind CSS", "React"] },
  { title: "Data & CLI", skills: ["pandas", "ETL Pipelines", "Click", "Rich", "pytest"] },
  { title: "Tools & Practices", skills: ["Git", "GitHub", "GitHub Actions", "System Design", "Agile"] },
];

export const projects: ProjectItem[] = [
  {
    title: "habitual habits",
    description:
      "A habit tracking API I built to get better at backend development. You can create habits, log completions, and track streaks, all behind JWT auth. I wrote a full pytest suite for it too, covering auth flows, CRUD, and the streak logic. Dockerized and ready to deploy.",
    tags: ["FastAPI", "Python", "JWT Auth", "Docker", "SQLAlchemy", "Pydantic", "SQLite", "pytest"],
    links: [{ href: "https://github.com/ckwame-jpg/habit-tracker-api", label: "GitHub", type: "repo" }],
  },
  {
    title: "fantasy football app",
    description:
      "Built this because I needed a better way to prep for my fantasy draft. It has a sortable draftboard, tier rankings, favorites by year, and stat columns for rushing, receiving, and passing. FastAPI serves player data while the Next.js frontend handles filtering and sorting live.",
    tags: ["FastAPI", "Next.js", "TypeScript", "Tailwind CSS", "React", "Python"],
    links: [
      {
        href: "https://fantasy-tool-chris-prempehs-projects.vercel.app",
        label: "Live Demo",
        type: "demo",
      },
      { href: "https://github.com/ckwame-jpg/fantasy-tool", label: "GitHub", type: "repo" },
    ],
  },
  {
    title: "taskboard",
    description:
      "A collaborative task board where multiple people can work in real time. Drag cards between columns and everyone sees updates instantly via WebSockets. Includes role-based permissions (owner, editor, viewer) and runs on a PostgreSQL + Next.js + Docker stack.",
    tags: ["FastAPI", "Next.js", "PostgreSQL", "WebSockets", "TypeScript", "Docker"],
    links: [
      { href: "https://taskboard-jade-nine.vercel.app", label: "Live Demo", type: "demo" },
      { href: "https://github.com/ckwame-jpg/taskboard", label: "GitHub", type: "repo" },
    ],
  },
  {
    title: "url shortener",
    description:
      "A URL shortener with async click analytics. Redirects stay fast because analytics processing runs in Celery workers with Redis. Full stack is orchestrated with Docker Compose.",
    tags: ["FastAPI", "Redis", "Celery", "PostgreSQL", "Docker", "Python"],
    links: [{ href: "https://github.com/ckwame-jpg/url-shortener", label: "GitHub", type: "repo" }],
  },
  {
    title: "gh-stats",
    description:
      "A CLI tool that pulls GitHub profile data and shows it in the terminal. Supports profile summaries, repo stats, recent activity, and side-by-side user comparisons.",
    tags: ["Python", "Click", "Rich", "GitHub API", "httpx", "pytest"],
    links: [{ href: "https://github.com/ckwame-jpg/gh-stats", label: "GitHub", type: "repo" }],
  },
  {
    title: "sports etl",
    description:
      "An ETL pipeline that pulls NFL player stats from ESPN, calculates PPR fantasy scores, and loads data into PostgreSQL. Includes upsert logic, rerun-safe behavior, and run-status tracking.",
    tags: ["Python", "pandas", "PostgreSQL", "SQLAlchemy", "ESPN API", "Docker"],
    links: [{ href: "https://github.com/ckwame-jpg/sports-etl", label: "GitHub", type: "repo" }],
  },
];

export const experiences: ExperienceItem[] = [
  {
    period: "Oct 2024 - Present",
    title: "VAR Technical Manager · Sportec Solutions",
    description:
      "Deployed, monitored, and troubleshot live technical video systems for MLS and international matches under zero-downtime requirements. Managed real-time incident response across VAR and MSR equipment while maintaining 100% operational uptime across assigned matches.",
  },
  {
    period: "2021 - 2023",
    title: "Data Entry Operator · Amazon",
    description:
      "Processed high-volume data across internal systems with 99.8% accuracy. Identified and eliminated inefficiencies in recordkeeping workflows while consistently exceeding productivity benchmarks.",
  },
];
