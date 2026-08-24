"use client";

import {
  Fragment,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { COMMANDS, renderPrompt } from "./terminal/commands";
import type { CommandContext } from "./terminal/commands";
import { complete } from "./terminal/completion";
import { Dim, Host, Ok } from "./terminal/output";
import { RttMs } from "@/hooks/os/useMeasuredRtt";

interface TerminalLine {
  id: number;
  node: ReactNode;
  asPre?: boolean;
}

const SUGGESTION_CHIPS = [
  "about",
  "projects",
  "cat skills.json",
  "cat certs.json",
  "curl /api/availability",
  "ping habitual-habits",
  "run habitual-habits",
  "sudo hire-me",
];

let lineSeq = 0;
const nextLineId = () => {
  lineSeq += 1;
  return lineSeq;
};

const initialBootLines = (): TerminalLine[] => [
  { id: nextLineId(), node: <Dim>Last login: just now from your browser</Dim> },
  {
    id: nextLineId(),
    node: (
      <span>
        <Ok>●</Ok> connected to <Host>chrisprem.xyz</Host> ·{" "}
        <Dim>
          tls 1.3 · <RttMs />
          ms
        </Dim>
      </span>
    ),
  },
  {
    id: nextLineId(),
    node: (
      <Dim>
        Type <span className="val">help</span> to see what&apos;s here, or click a suggestion below.
      </Dim>
    ),
  },
  { id: nextLineId(), node: " " },
];

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>(initialBootLines);
  const [cwd, setCwd] = useState("~");
  const [value, setValue] = useState("");
  const cwdRef = useRef(cwd);
  cwdRef.current = cwd;
  const historyRef = useRef<string[]>([]);
  const histIdxRef = useRef<number>(-1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollBodyToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      const el = bodyRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  useEffect(() => {
    scrollBodyToEnd();
  }, [lines, scrollBodyToEnd]);

  const append = useCallback((line: Omit<TerminalLine, "id">) => {
    setLines((prev) => [...prev, { id: nextLineId(), ...line }]);
  }, []);

  const exec = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      historyRef.current.push(trimmed);
      histIdxRef.current = historyRef.current.length;

      append({
        node: (
          <>
            {renderPrompt(cwdRef.current)} <span>{trimmed}</span>
          </>
        ),
      });

      const [cmd, ...rest] = trimmed.split(/\s+/);
      const arg = rest.join(" ");
      const fn = COMMANDS[cmd];
      if (!fn) {
        append({
          node: (
            <>
              <span className="err">{cmd}: command not found</span>{" "}
              <Dim>- try `help`</Dim>
            </>
          ),
        });
        return;
      }

      const ctx: CommandContext = {
        cwd: cwdRef.current,
        setCwd: (next) => {
          cwdRef.current = next;
          setCwd(next);
        },
        history: historyRef.current,
        scrollTo: (selector) => {
          document.querySelector(selector)?.scrollIntoView({ block: "center", behavior: "smooth" });
        },
      };
      const result = fn(arg, ctx);

      if (result.kind === "clear") {
        setLines([]);
        return;
      }
      if (result.kind === "output") {
        append({ node: result.node, asPre: true });
      }
    },
    [append],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        exec(value);
        setValue("");
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (histIdxRef.current > 0) histIdxRef.current -= 1;
        const item = historyRef.current[histIdxRef.current];
        if (item != null) setValue(item);
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (histIdxRef.current < historyRef.current.length - 1) {
          histIdxRef.current += 1;
          setValue(historyRef.current[histIdxRef.current] ?? "");
        } else {
          histIdxRef.current = historyRef.current.length;
          setValue("");
        }
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        const result = complete(value);
        if (result.next !== value) {
          setValue(result.next);
        } else if (result.hint?.length) {
          append({
            node: <Dim>{result.hint.join("   ")}</Dim>,
          });
        }
        return;
      }
      if (event.ctrlKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        setLines([]);
        return;
      }
      if (event.ctrlKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        append({
          node: (
            <>
              {renderPrompt(cwdRef.current)} <span>{value}</span>
              <Dim>^C</Dim>
            </>
          ),
        });
        setValue("");
      }
    },
    [append, exec, value],
  );

  const onBoxClick = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.toString()) return;
    inputRef.current?.focus();
  }, []);

  const runChip = useCallback(
    (chip: string) => {
      setValue("");
      exec(chip);
    },
    [exec],
  );

  const renderedLines = useMemo(
    () =>
      lines.map((line) => (
        <div key={line.id} className="line">
          {line.asPre ? <pre>{line.node}</pre> : line.node}
        </div>
      )),
    [lines],
  );

  return (
    <>
      <div
        id="terminal"
        className="terminal"
        aria-label="02 Terminal"
        onClick={onBoxClick}
      >
        <div className="term-bar">
          <div className="dots" aria-hidden>
            <i />
            <i />
            <i />
          </div>
          <div className="title">visitor@chrisprem.xyz · ~ · zsh</div>
          <div className="hint">
            <kbd>↑</kbd>
            <kbd>↓</kbd> · <kbd>TAB</kbd> · <kbd>ctrl</kbd>+<kbd>L</kbd>
          </div>
        </div>
        <div
          ref={bodyRef}
          className="term-body"
          role="log"
          aria-live="polite"
        >
          {renderedLines}
          <div className="line term-input-row">
            <span className="prefix">{renderPrompt(cwd)}</span>
            <input
              ref={inputRef}
              className="term-input"
              autoComplete="off"
              spellCheck={false}
              aria-label="terminal input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>
      </div>
      <div className="term-suggest" style={{ marginTop: 10 }}>
        {SUGGESTION_CHIPS.map((chip) => (
          <button key={chip} type="button" onClick={() => runChip(chip)}>
            {chip}
          </button>
        ))}
      </div>
    </>
  );
}
