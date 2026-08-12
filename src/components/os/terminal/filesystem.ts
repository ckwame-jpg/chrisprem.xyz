import { UPTIME_STORY, incidentDateUtc, uptimePct } from "@/lib/os/uptimeStory";

export const FS: Record<string, string> = {
  "about.md": `# Chris Prempeh
Software Engineer · 2024 → now
BS in Computer Science, Southern New Hampshire University — Class of 2026

I build software end-to-end: backend services, frontend UI,
infra, and the glue in between. Happiest when I own a feature
from "what should this be?" to "it's in production."

Currently: VAR Technical Manager · Sportec Solutions
Summer 2026: Network Technician · FIFA World Cup 2026 (AT&T Stadium)
Before that: data entry / analytics @ Amazon

The stack I reach for:
  backend     python · fastapi · sqlalchemy · jwt · rest
  frontend    typescript · react · next.js · tailwind
  data        postgresql · sql
  infra       docker · aws · github actions · vercel · linux
  tools       git · tableau · salesforce
  curious     rust · go · kubernetes

Certs: Salesforce Advanced Administrator · Salesforce Platform Developer I

Based in Dallas–Fort Worth, TX · open to backend, full-stack, and cloud/DevOps roles
Reach me: ckprempeh@outlook.com · github.com/ckwame-jpg · linkedin.com/in/christopher-prempeh
`,
  "projects/habitual-habits/README.md": `# habitual-habits
Habit tracking API with JWT auth. CRUD + completions + streaks.
FastAPI + SQLite + SQLAlchemy. Fully dockerized.

→ Try: \`run habitual-habits\` to see the request flow
→ Source: github.com/ckwame-jpg/habit-tracker-api
`,
  "projects/taskboard/README.md": `# taskboard
Real-time collaborative kanban. Card moves broadcast to all
sessions via WebSockets. RBAC (owner / editor / viewer) + JWT.
FastAPI + Postgres backend, Next.js frontend. Dockerized.

→ Try: \`run taskboard\` to see the request flow
→ Live: https://taskboard-jade-nine.vercel.app
→ Source: github.com/ckwame-jpg/taskboard
`,
  "projects/fantasy-tool/README.md": `# fantasy-tool
Real-time fantasy football toolkit. Live multi-user drafts via
Socket.IO, VORP-based trade analyzer, lineup optimizer with
ceiling/floor strategies, waiver wire, Sleeper league sync.
Next.js 15 (Vercel) + FastAPI/Socket.IO (Render). No database.

→ Try: \`run fantasy-tool\` to see the request flow
→ Live: https://fantasy-tool-chris-prempehs-projects.vercel.app/draftboard
→ Source: github.com/ckwame-jpg/fantasy-tool
`,
  "projects/url-shortener/README.md": `# url-shortener
Sub-10ms redirects + async click analytics. Click logging
runs in background Celery workers and never blocks the redirect.
FastAPI + Postgres + Redis. JWT auth. 4 services in Docker Compose.

→ Try: \`run url-shortener\` to see the request flow
→ Source: github.com/ckwame-jpg/url-shortener
`,
  "projects/gh-stats/README.md": `# gh-stats
Yearly contribution recap, but actually accurate.
Python + GitHub API + matplotlib. CI'd as a GitHub Action.

→ Source: github.com/ckwame-jpg/gh-stats
`,
  "projects/chrisprem.xyz/README.md": `# this site
Next.js + TypeScript, deployed on Vercel.
A working terminal, draggable architecture diagrams, a real
contact endpoint, measured RTT, and a latency globe.
The site is the portfolio piece.

→ Source: github.com/ckwame-jpg/chrisprem.xyz
`,
  "experience.txt": `2026 (summer) · FIFA World Cup 2026 · Network Technician, AT&T Stadium
2024 → now    · Sportec Solutions  · VAR Technical Manager
2021 → 2023   · Amazon             · data entry / analytics
2024 → 2026   · BS in Computer Science @ SNHU — Class of 2026
`,
  "skills.json": `{
  "backend":   ["python", "fastapi", "sqlalchemy", "jwt", "rest"],
  "frontend":  ["typescript", "react", "next.js", "tailwind"],
  "data":      ["postgresql", "sql"],
  "infra":     ["docker", "aws", "github actions", "vercel", "linux"],
  "tools":     ["git", "tableau", "salesforce"],
  "curious":   ["rust", "go", "kubernetes"]
}`,
  "certs.json": `{
  "salesforce": [
    {
      "name": "Salesforce Certified Advanced Administrator",
      "short": "Advanced Admin"
    },
    {
      "name": "Salesforce Certified Platform Developer I",
      "short": "Platform Developer I"
    }
  ]
}`,
  "contact.json": `{
  "email":     "ckprempeh@outlook.com",
  "github":    "github.com/ckwame-jpg",
  "linkedin":  "linkedin.com/in/christopher-prempeh",
  "resume":    "chrisprem.xyz/resume.pdf",
  "available": true,
  "remote":    true
}`,
  "uptime.log": `${UPTIME_STORY.windowDays}d uptime: ${uptimePct()}%
last incident: ${incidentDateUtc()} (${UPTIME_STORY.incident.durationLabel}, ${UPTIME_STORY.incident.cause})
postmortem: yes, written, internal
`,
};

export const NEIGHBORS: Record<"" | "projects/", string[]> = {
  "": ["about.md", "experience.txt", "skills.json", "certs.json", "contact.json", "uptime.log", "projects/"],
  "projects/": [
    "habitual-habits/",
    "url-shortener/",
    "taskboard/",
    "fantasy-tool/",
    "gh-stats/",
    "chrisprem.xyz/",
  ],
};

export const KNOWN_PROJECTS = [
  "habitual-habits",
  "url-shortener",
  "taskboard",
  "fantasy-tool",
  "gh-stats",
] as const;

export type KnownProject = (typeof KNOWN_PROJECTS)[number];

export const HOST = "chrisprem.xyz";
export const USER = "visitor";
