"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { emit } from "@/lib/os/bus";
import { SITE_REPO_URL } from "@/lib/os/links";
import type { ProjectId } from "@/lib/os/types";

interface VimCommand {
  cmd: string;
  desc: string;
  run: () => void;
}

const SCROLL_OFFSET = 60;

function scrollToSelector(selector: string) {
  const el = document.querySelector(selector);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function focusProject(project: ProjectId) {
  emit("arch:focus", { project });
  window.setTimeout(() => scrollToSelector("#arch"), 80);
}

const COMMANDS: VimCommand[] = [
  { cmd: "goto hero", desc: "Jump to the top", run: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
  { cmd: "goto shell", desc: "Jump to the terminal", run: () => scrollToSelector("#terminal") },
  { cmd: "goto systems", desc: "Jump to the architecture diagrams", run: () => scrollToSelector("#arch") },
  { cmd: "goto uptime", desc: "Jump to observability", run: () => scrollToSelector(".uptime") },
  { cmd: "goto contact", desc: "Jump to the contact endpoint", run: () => scrollToSelector("#endpoint") },
  { cmd: "goto globe", desc: "Open the latency globe", run: () => { window.location.href = "/playground/latency"; } },
  { cmd: "project habits", desc: "Load the habitual-habits architecture", run: () => focusProject("habitual-habits") },
  { cmd: "project shortener", desc: "Load the url-shortener architecture", run: () => focusProject("url-shortener") },
  { cmd: "project taskboard", desc: "Load the taskboard architecture", run: () => focusProject("taskboard") },
  { cmd: "project fantasy", desc: "Load the fantasy-tool architecture", run: () => focusProject("fantasy-tool") },
  { cmd: "project gh", desc: "Load the gh-stats architecture", run: () => focusProject("gh-stats") },
  { cmd: "replay trace", desc: "Replay the hero request trace", run: () => emit("trace:replay") },
  { cmd: "source", desc: "View this site's source on GitHub", run: () => window.open(SITE_REPO_URL, "_blank", "noopener,noreferrer") },
  { cmd: "whoami", desc: "Open about.md in the terminal", run: () => scrollToSelector("#terminal") },
  { cmd: "help", desc: "List commands (you're looking at it)", run: () => {} },
  { cmd: "quit", desc: "Close this command bar", run: () => {} },
];

function fuzzyMatch(query: string, cmd: VimCommand): boolean {
  const q = query.toLowerCase().replace(/^:/, "").trim();
  if (!q) return true;
  const target = cmd.cmd.toLowerCase();
  let i = 0;
  for (const ch of target) {
    if (ch === q[i]) i += 1;
    if (i === q.length) return true;
  }
  return target.includes(q);
}

export default function VimBar() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [selIdx, setSelIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => COMMANDS.filter((c) => fuzzyMatch(value, c)).slice(0, 8), [value]);

  useEffect(() => {
    if (selIdx >= matches.length) setSelIdx(0);
  }, [matches, selIdx]);

  const closeBar = useCallback(() => {
    setOpen(false);
    setValue("");
    setSelIdx(0);
    inputRef.current?.blur();
  }, []);

  const openBar = useCallback(() => {
    setOpen(true);
    setValue("");
    setSelIdx(0);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const runMatch = useCallback(
    (idx: number) => {
      const m = matches[idx];
      if (!m) return;
      closeBar();
      window.setTimeout(() => m.run(), 80);
    },
    [matches, closeBar],
  );

  // global key listener: `:` or ⌘P / ctrl-P opens; Esc closes etc.
  useEffect(() => {
    const onGlobalKey = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      const inField =
        tag === "INPUT" || tag === "TEXTAREA"
          ? target !== inputRef.current
          : false;
      if (!open && !inField && (event.key === ":" || ((event.key === "p" || event.key === "P") && (event.metaKey || event.ctrlKey)))) {
        event.preventDefault();
        openBar();
      } else if (open && event.key === "Escape") {
        event.preventDefault();
        closeBar();
      }
    };
    document.addEventListener("keydown", onGlobalKey);
    return () => document.removeEventListener("keydown", onGlobalKey);
  }, [open, openBar, closeBar]);

  const onInputKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runMatch(selIdx);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelIdx((i) => Math.min(matches.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelIdx((i) => Math.max(0, i - 1));
    } else if (event.key === "Tab") {
      event.preventDefault();
      const m = matches[selIdx];
      if (m) setValue(m.cmd);
    }
  };

  return (
    <div
      className={`vim${open ? " open" : ""}`}
      aria-hidden={!open}
      inert={!open}
      role="dialog"
      aria-label="command bar"
    >
      <div className="vim-wrap">
        <span className="vim-prompt">:</span>
        <input
          ref={inputRef}
          className="vim-input"
          autoComplete="off"
          spellCheck={false}
          placeholder="goto contact · project habits · replay trace · source · help"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onInputKey}
          aria-label="command input"
        />
        <span className="vim-hint">
          <kbd>esc</kbd> close · <kbd>tab</kbd> complete · <kbd>↵</kbd> run
        </span>
      </div>
      <div className="vim-suggest">
        {matches.map((m, i) => (
          <button
            key={m.cmd}
            type="button"
            className={`row${i === selIdx ? " sel" : ""}`}
            onClick={() => runMatch(i)}
            onMouseEnter={() => setSelIdx(i)}
          >
            <span>{i === selIdx ? "›" : ""}</span>
            <span className="cmd">:{m.cmd}</span>
            <span>{m.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
