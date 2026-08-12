import { COMMANDS } from "./commands";
import { KNOWN_PROJECTS } from "./filesystem";

const FILE_TOKENS = [
  "about.md",
  "experience.txt",
  "skills.json",
  "certs.json",
  "contact.json",
  "uptime.log",
  "projects/",
];
const API_TOKENS = ["/api/availability", "/api/projects", "/api/skills"];
const EXTRA_TOKENS = ["hire-me", "uptime/globe"];

const ALL_TOKENS = [
  ...Object.keys(COMMANDS),
  ...FILE_TOKENS,
  ...KNOWN_PROJECTS,
  ...API_TOKENS,
  ...EXTRA_TOKENS,
];

export interface Completion {
  next: string;
  hint?: string[];
}

export function complete(prefix: string): Completion {
  const parts = prefix.split(" ");
  const last = parts[parts.length - 1] ?? "";
  if (!last) return { next: prefix };
  const matches = ALL_TOKENS.filter((token) => token.startsWith(last));
  if (matches.length === 1) {
    parts[parts.length - 1] = matches[0];
    return { next: parts.join(" ") };
  }
  if (matches.length > 1) {
    return { next: prefix, hint: matches };
  }
  return { next: prefix };
}
