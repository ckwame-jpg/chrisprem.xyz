import type { ReactNode } from "react";

export const Dim = ({ children }: { children: ReactNode }) => (
  <span className="dim">{children}</span>
);
export const Ok = ({ children }: { children: ReactNode }) => (
  <span className="ok">{children}</span>
);
export const Err = ({ children }: { children: ReactNode }) => (
  <span className="err">{children}</span>
);
export const Warn = ({ children }: { children: ReactNode }) => (
  <span className="warn">{children}</span>
);
export const Key = ({ children }: { children: ReactNode }) => (
  <span className="key">{children}</span>
);
export const Val = ({ children }: { children: ReactNode }) => (
  <span className="val">{children}</span>
);
export const Dir = ({ children }: { children: ReactNode }) => (
  <span className="dir">{children}</span>
);
export const File = ({ children }: { children: ReactNode }) => (
  <span className="file">{children}</span>
);
export const Host = ({ children }: { children: ReactNode }) => (
  <span className="host">{children}</span>
);

/** Href for link-shaped text (urls, bare known domains, emails), else null. */
export function linkHrefFor(text: string): string | null {
  if (/^https?:\/\/\S+$/.test(text)) return text;
  if (/^(github\.com|linkedin\.com|chrisprem\.xyz|[a-z0-9-]+\.vercel\.app)\/\S+$/.test(text)) {
    return `https://${text}`;
  }
  if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(text)) return `mailto:${text}`;
  return null;
}

function TermLink({ href, children }: { href: string; children: ReactNode }) {
  const external = !href.startsWith("mailto:");
  return (
    <a
      className="term-link"
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

const LINK_SCAN_RE =
  /(https?:\/\/\S+|(?:github\.com|linkedin\.com|chrisprem\.xyz|[a-z0-9-]+\.vercel\.app)\/\S+|[\w.+-]+@[\w-]+\.[\w.-]+)/g;

/** Wrap link-shaped substrings of plain text in anchors. */
export function linkify(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  LINK_SCAN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = LINK_SCAN_RE.exec(text)) !== null) {
    const raw = match[0];
    const href = linkHrefFor(raw);
    if (!href) continue;
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(
      <TermLink key={`lnk${key++}`} href={href}>
        {raw}
      </TermLink>,
    );
    cursor = match.index + raw.length;
  }
  if (!parts.length) return text;
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

interface JsonLineProps {
  line: string;
}

const KEY_RE = /"([^"]+)":/g;
const STR_RE = /:\s+"([^"]*)"/g;
const BOOL_RE = /:\s+(true|false)/g;
const NUM_RE = /:\s+(\d+)/g;
// Standalone strings (e.g. array items). Runs last: overlap with keys and
// colon-values is dropped by the `m.start < cursor` skip below.
const BARE_STR_RE = /"([^"]*)"/g;

type Token = { kind: "raw" | "key" | "str" | "bool" | "num"; text: string };

function tokenizeJsonLine(line: string): Token[] {
  const matches: { start: number; end: number; kind: Token["kind"]; text: string }[] = [];
  for (const re of [KEY_RE, STR_RE, BOOL_RE, NUM_RE, BARE_STR_RE] as const) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(line)) !== null) {
      const kind: Token["kind"] =
        re === KEY_RE
          ? "key"
          : re === STR_RE || re === BARE_STR_RE
            ? "str"
            : re === BOOL_RE
              ? "bool"
              : "num";
      // KEY_RE / STR_RE: absorb the surrounding quotes into the token so the renderer
      // doesn't add them back (which was producing `""email""`). bool/num have no quotes.
      if (re === KEY_RE) {
        matches.push({
          start: match.index,
          end: match.index + match[1].length + 2,
          kind,
          text: `"${match[1]}"`,
        });
      } else if (re === STR_RE) {
        const quoteStart = match.index + match[0].indexOf('"');
        matches.push({
          start: quoteStart,
          end: quoteStart + match[1].length + 2,
          kind,
          text: `"${match[1]}"`,
        });
      } else if (re === BARE_STR_RE) {
        matches.push({
          start: match.index,
          end: match.index + match[1].length + 2,
          kind,
          text: `"${match[1]}"`,
        });
      } else {
        const valStart = match.index + match[0].indexOf(match[1]);
        matches.push({
          start: valStart,
          end: valStart + match[1].length,
          kind,
          text: match[1],
        });
      }
    }
  }
  matches.sort((a, b) => a.start - b.start);
  const tokens: Token[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start < cursor) continue;
    if (m.start > cursor) tokens.push({ kind: "raw", text: line.slice(cursor, m.start) });
    tokens.push({ kind: m.kind, text: m.text });
    cursor = m.end;
  }
  if (cursor < line.length) tokens.push({ kind: "raw", text: line.slice(cursor) });
  return tokens;
}

export function JsonLine({ line }: JsonLineProps) {
  const tokens = tokenizeJsonLine(line);
  return (
    <>
      {tokens.map((t, i) => {
        if (t.kind === "key") return <span key={i} className="key">{t.text}</span>;
        if (t.kind === "str") {
          const inner = t.text.slice(1, -1);
          const href = linkHrefFor(inner);
          if (href) {
            return (
              <span key={i} className="str">
                &quot;
                <TermLink href={href}>{inner}</TermLink>
                &quot;
              </span>
            );
          }
          return <span key={i} className="str">{t.text}</span>;
        }
        if (t.kind === "bool") return <span key={i} className="bool">{t.text}</span>;
        if (t.kind === "num") return <span key={i} className="num">{t.text}</span>;
        return <span key={i}>{t.text}</span>;
      })}
    </>
  );
}
