'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HistoryEntry {
  command: string;
  output: string;
}

const commands: Record<string, string> = {
  help: 'Available commands: help, ls, cat 404.txt, cd home, sudo find page',
  ls: 'home/  projects/  skills/  404.txt',
  'cat 404.txt':
    "ERROR 404: Page not found.\nLast seen: somewhere between /dev/null and the void.\nIf found, please return to the nearest <Link> tag.",
  'cd home': '__NAVIGATE__/',
  'go home': '__NAVIGATE__/',
  'sudo find page': 'Permission denied. Nice try.',
};

export default function MiniTerminal() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return;

    const output = commands[trimmed];

    if (output?.startsWith('__NAVIGATE__')) {
      const path = output.replace('__NAVIGATE__', '');
      router.push(path);
      return;
    }

    setHistory((prev) => [
      ...prev,
      {
        command: trimmed,
        output: output || `command not found: ${trimmed}. Type "help" for available commands.`,
      },
    ]);
    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const newIndex = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInput(cmdHistory[newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const newIndex = historyIndex + 1;
      if (newIndex >= cmdHistory.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      }
    }
  };

  return (
    <div className="mt-8 w-full max-w-md mx-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] backdrop-blur-md overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-subtle)]">
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-green-500/60" />
        <span className="ml-2 text-xs text-[var(--text-muted)] font-mono">lost-terminal</span>
      </div>
      <div
        ref={scrollRef}
        className="p-4 font-mono text-sm max-h-48 overflow-y-auto"
        onClick={() => inputRef.current?.focus()}
      >
        <p className="text-[var(--text-muted)] mb-2">Type &quot;help&quot; for available commands.</p>
        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            <p className="text-[var(--text-primary)]">
              <span className="text-green-400">visitor@404</span>
              <span className="text-[var(--text-muted)]">:</span>
              <span className="text-blue-400">~</span>
              <span className="text-[var(--text-muted)]">$ </span>
              {entry.command}
            </p>
            <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{entry.output}</p>
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-green-400">visitor@404</span>
          <span className="text-[var(--text-muted)]">:</span>
          <span className="text-blue-400">~</span>
          <span className="text-[var(--text-muted)]">$ </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-[var(--text-primary)] ml-1 caret-green-400"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
}
