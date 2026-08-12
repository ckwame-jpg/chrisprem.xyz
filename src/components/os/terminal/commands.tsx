import { Fragment, type ReactNode } from "react";
import { FS, KNOWN_PROJECTS, NEIGHBORS } from "./filesystem";
import { Dim, Dir, Err, File, Host, JsonLine, Key, Ok, Val, Warn, linkify } from "./output";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "@/lib/os/links";
import {
  UPTIME_STORY,
  errorBudgetPct,
  incidentDateUtc,
  mttrLabel,
  uptimePct,
} from "@/lib/os/uptimeStory";
import { emit } from "@/lib/os/bus";
import type { ProjectId } from "@/lib/os/types";

export type CommandResult =
  | { kind: "output"; node: ReactNode }
  | { kind: "clear" }
  | { kind: "none" };

export interface CommandContext {
  cwd: string;
  setCwd: (cwd: string) => void;
  history: string[];
  scrollTo: (selector: string) => void;
}

export type Command = (arg: string, ctx: CommandContext) => CommandResult;

function joinLines(...rows: ReactNode[]): ReactNode {
  const parts: ReactNode[] = [];
  rows.forEach((row, i) => {
    parts.push(<Fragment key={`r${i}`}>{row}</Fragment>);
    if (i < rows.length - 1) parts.push(<Fragment key={`n${i}`}>{"\n"}</Fragment>);
  });
  return parts;
}

const out = (node: ReactNode): CommandResult => ({ kind: "output", node });
const none = (): CommandResult => ({ kind: "none" });
const clear = (): CommandResult => ({ kind: "clear" });

function listDir(items: string[]): ReactNode {
  return items.map((n, i) => (
    <Fragment key={i}>
      {i > 0 ? "   " : null}
      {n.endsWith("/") ? <Dir>{n}</Dir> : <File>{n}</File>}
    </Fragment>
  ));
}

function asciiTree(): ReactNode {
  return joinLines(
    "~",
    "├── about.md",
    "├── experience.txt",
    "├── skills.json",
    "├── certs.json",
    "├── contact.json",
    "├── uptime.log",
    "└── projects/",
    <span>{"    ├── "}<Dir>habitual-habits/</Dir></span>,
    <span>{"    ├── "}<Dir>url-shortener/</Dir></span>,
    <span>{"    ├── "}<Dir>taskboard/</Dir></span>,
    <span>{"    ├── "}<Dir>fantasy-tool/</Dir></span>,
    <span>{"    ├── "}<Dir>gh-stats/</Dir></span>,
    <span>{"    └── "}<Dir>chrisprem.xyz/</Dir></span>,
  );
}

function curlResponse(headers: ReactNode[], body: ReactNode): ReactNode {
  return joinLines(...headers, "", body);
}

interface BoxRow {
  node: ReactNode;
  /** Exactly the text that renders, markup-free — drives the padding math. */
  plain: string;
}

/**
 * ASCII box with computed borders/padding. Replaces hand-counted spaces,
 * which drifted out of alignment whenever the content changed length.
 * Wrapped in .term-box (nowrap + horizontal scroll) so narrow screens
 * scroll instead of shattering the box.
 */
function padBox(rows: BoxRow[]): ReactNode {
  const inner = Math.max(...rows.map((r) => r.plain.length)) + 4;
  const lines: ReactNode[] = [`┌${"─".repeat(inner)}┐`];
  rows.forEach((row, i) => {
    lines.push(
      <span key={`bx${i}`}>
        │{"  "}
        {row.node}
        {" ".repeat(inner - 4 - row.plain.length)}
        {"  "}│
      </span>,
    );
  });
  lines.push(`└${"─".repeat(inner)}┘`);
  return <span className="term-box">{joinLines(...lines)}</span>;
}

function jsonLines(text: string): ReactNode {
  return joinLines(...text.split("\n").map((l, i) => <JsonLine key={i} line={l} />));
}

export const COMMANDS: Record<string, Command> = {
  help() {
    return out(
      joinLines(
        <Dim>Available commands:</Dim>,
        <span>{"  "}<Key>ls</Key>             List files in the current directory</span>,
        <span>{"  "}<Key>cd</Key> &lt;dir&gt;       Change directory (try: cd projects)</span>,
        <span>{"  "}<Key>cat</Key> &lt;file&gt;     Print file contents</span>,
        <span>{"  "}<Key>whoami</Key>         Print identity</span>,
        <span>{"  "}<Key>uptime</Key>         Print site uptime stats</span>,
        <span>{"  "}<Key>ping</Key> &lt;host&gt;    Synthetic latency check</span>,
        <span>{"  "}<Key>curl</Key> &lt;url&gt;     Hit a portfolio endpoint</span>,
        <span>{"  "}<Key>run</Key> &lt;project&gt;  Trigger a project demo</span>,
        <span>{"  "}<Key>tree</Key>           Print the site map</span>,
        <span>{"  "}<Key>history</Key>        Recent commands</span>,
        <span>{"  "}<Key>clear</Key>          Clear the screen</span>,
        <span>{"  "}<Key>about</Key>          Shorthand for: cat about.md</span>,
        <span>{"  "}<Key>projects</Key>       Shorthand for: ls projects/</span>,
        <span>{"  "}<Key>contact</Key>        Open the contact endpoint</span>,
        <span>{"  "}<Key>sudo hire-me</Key>   ★ Requires elevated permissions</span>,
        "",
        <Dim>Tip: ↑/↓ for history · TAB to complete</Dim>,
      ),
    );
  },

  ls(arg, ctx) {
    const target = arg || (ctx.cwd === "~" ? "" : ctx.cwd.replace("~/", ""));
    if (target === "projects" || target === "projects/") {
      return out(listDir(NEIGHBORS["projects/"]));
    }
    if (!target || target === "~") {
      return out(listDir(NEIGHBORS[""]));
    }
    return out(<Err>ls: {target}: no such directory</Err>);
  },

  cd(arg, ctx) {
    if (!arg || arg === "~" || arg === "/" || arg === "..") {
      ctx.setCwd("~");
      return none();
    }
    const a = arg.replace(/\/$/, "");
    if (a === "projects") {
      ctx.setCwd("~/projects");
      return none();
    }
    if (a === "uptime/globe") {
      window.location.href = "/playground/latency";
      return out(<Ok>▸ Navigating to /playground/latency…</Ok>);
    }
    if (ctx.cwd === "~/projects") {
      const valid = NEIGHBORS["projects/"].map((n) => n.replace(/\/$/, ""));
      if (valid.includes(a)) {
        ctx.setCwd(`~/projects/${a}`);
        return none();
      }
    }
    return out(<Err>cd: {arg}: no such directory</Err>);
  },

  cat(arg, ctx) {
    if (!arg) return out(<Err>cat: missing argument</Err>);
    let path = arg;
    if (ctx.cwd.startsWith("~/projects") && !arg.includes("/")) {
      const proj = ctx.cwd.replace("~/projects", "").replace(/^\//, "");
      if (proj && arg === "README.md") path = `projects/${proj}/${arg}`;
    } else if (ctx.cwd === "~/projects" && !arg.includes("/")) {
      path = `projects/${arg}/README.md`;
    }
    const text = FS[path] ?? FS[arg];
    if (!text) return out(<Err>cat: {arg}: no such file</Err>);
    if (arg.endsWith(".json")) return out(jsonLines(text));
    return out(<>{linkify(text)}</>);
  },

  about(_arg, ctx) {
    return COMMANDS.cat("about.md", ctx);
  },

  projects(_arg, ctx) {
    ctx.setCwd("~/projects");
    return COMMANDS.ls("", { ...ctx, cwd: "~/projects" });
  },

  whoami() {
    return out(`Chris Prempeh · Software Engineer · full-stack · ${new Date().toISOString().slice(0, 10)}`);
  },

  uptime() {
    return out(
      joinLines(
        <span><Ok>●</Ok> chrisprem.xyz : <Ok>healthy</Ok></span>,
        <span>last {UPTIME_STORY.windowDays}d uptime: <Val>{uptimePct()}%</Val></span>,
        <span>last incident:    {incidentDateUtc()} ({UPTIME_STORY.incident.durationLabel}, {UPTIME_STORY.incident.cause})</span>,
        <span>mttr ({UPTIME_STORY.windowDays}d):        <Val>{mttrLabel()}</Val></span>,
        <span>error budget:     <Ok>{errorBudgetPct()}% remaining</Ok></span>,
      ),
    );
  },

  ping(arg) {
    const host = arg || "chrisprem.xyz";
    const seq: ReactNode[] = [];
    for (let i = 0; i < 4; i += 1) {
      const ms = (28 + Math.random() * 18).toFixed(1);
      seq.push(
        <span key={`p-${i}`}>64 bytes from {host}: icmp_seq={i} time=<Val>{ms}</Val> ms</span>,
      );
    }
    return out(
      joinLines(
        `PING ${host} (203.0.113.42): 56 data bytes`,
        ...seq,
        "",
        `--- ${host} ping statistics ---`,
        <span>4 packets transmitted, 4 received, <Ok>0% packet loss</Ok></span>,
      ),
    );
  },

  curl(arg) {
    if (!arg) {
      return out(<Err>curl: try `curl /api/availability` or `curl /api/projects`</Err>);
    }
    const path = arg.replace(/^https?:\/\/[^/]+/, "");
    if (path === "/api/availability" || arg.endsWith("availability")) {
      return out(
        curlResponse(
          [
            <Dim key="h1">HTTP/2 200</Dim>,
            <Dim key="h2">content-type: application/json</Dim>,
            <Dim key="h3">x-request-id: req_8a2f1c</Dim>,
          ],
          jsonLines(FS["contact.json"]),
        ),
      );
    }
    if (path === "/api/projects" || arg.endsWith("projects")) {
      const list = NEIGHBORS["projects/"].map((n) => `"${n.replace(/\/$/, "")}"`).join(", ");
      return out(
        joinLines(<Dim>HTTP/2 200</Dim>, "", `[${list}]`),
      );
    }
    if (path === "/api/skills" || arg.endsWith("skills")) {
      return out(
        curlResponse([<Dim key="h1">HTTP/2 200</Dim>], jsonLines(FS["skills.json"])),
      );
    }
    return out(
      joinLines(
        <Err>curl: 404 {path}</Err>,
        <Dim>try: /api/availability · /api/projects · /api/skills</Dim>,
      ),
    );
  },

  run(arg) {
    if (!arg) return out(<Err>run: which project? try: run habitual-habits</Err>);
    const proj = arg.replace(/\/$/, "") as ProjectId;
    if (!KNOWN_PROJECTS.includes(proj as never)) {
      return out(<Err>run: {proj}: not a runnable project</Err>);
    }
    emit("trace:replay");
    emit("arch:focus", { project: proj });
    return out(
      joinLines(
        <span><Ok>▸</Ok> Spinning up <Val>{proj}</Val>…</span>,
        <span>{"   "}Request traced ↑ in the hero</span>,
        <span>{"   "}Architecture loaded ↓</span>,
        <span>{"   "}<Dim>Scroll up for the trace, down for the system.</Dim></span>,
      ),
    );
  },

  tree() {
    return out(asciiTree());
  },

  history(_arg, ctx) {
    if (!ctx.history.length) return out(<Dim>No history yet</Dim>);
    return out(
      joinLines(
        ...ctx.history.slice(-15).map((h, i) => `  ${String(i + 1).padStart(3, " ")}  ${h}`),
      ),
    );
  },

  clear() {
    return clear();
  },

  contact(_arg, ctx) {
    ctx.scrollTo("#endpoint");
    return out(<span><Ok>▸</Ok> Opening <Val>/api/contact</Val> ↓</span>);
  },

  sudo(arg) {
    if ((arg || "").trim() === "hire-me") {
      const github = GITHUB_URL.replace("https://", "");
      const linkedin = LINKEDIN_URL.replace("https://www.", "").replace(/\/$/, "");
      return out(
        joinLines(
          <Warn>[sudo] password for visitor: ********</Warn>,
          <Ok>authenticated.</Ok>,
          "",
          padBox([
            { node: <Val>Hi! You can reach me at:</Val>, plain: "Hi! You can reach me at:" },
            { node: "", plain: "" },
            {
              node: <span>email:    <Key>{linkify(EMAIL)}</Key></span>,
              plain: `email:    ${EMAIL}`,
            },
            {
              node: <span>github:   <Key>{linkify(github)}</Key></span>,
              plain: `github:   ${github}`,
            },
            {
              node: <span>linkedin: <Key>{linkify(linkedin)}</Key></span>,
              plain: `linkedin: ${linkedin}`,
            },
            { node: "", plain: "" },
            {
              node: <span>status:   <Ok>Open to backend, full-stack,</Ok></span>,
              plain: "status:   Open to backend, full-stack,",
            },
            {
              node: <span>{"          "}<Ok>and cloud/DevOps roles</Ok></span>,
              plain: "          and cloud/DevOps roles",
            },
            { node: "", plain: "" },
            {
              node: "I ship boring-critical systems. Let's talk.",
              plain: "I ship boring-critical systems. Let's talk.",
            },
          ]),
        ),
      );
    }
    return out(<Err>sudo: {arg || ""}: command requires elevated bullshit</Err>);
  },

  echo(arg) {
    return out(<>{arg || ""}</>);
  },

  pwd(_arg, ctx) {
    return out(ctx.cwd === "~" ? "/home/visitor" : `/home/visitor/${ctx.cwd.replace("~/", "")}`);
  },

  date() {
    return out(new Date().toString());
  },

  exit() {
    return out(<Dim>Connection closed by remote host. (Refresh to reconnect.)</Dim>);
  },
};

export const PROMPT_HOST = "chrisprem.xyz";
export const PROMPT_USER = "visitor";

export function renderPrompt(cwd: string): ReactNode {
  return (
    <span>
      <span className="user">{PROMPT_USER}</span>
      <span className="at">@</span>
      <Host>{PROMPT_HOST}</Host>
      <Dim>:</Dim>
      <span className="path">{cwd}</span>
      <span className="prompt">$</span>
    </span>
  );
}
