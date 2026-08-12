'use client';
import { useEffect, useState } from 'react';

interface Line {
  type: 'command' | 'result' | 'tagline';
  text: string;
}

const sequence: Line[] = [
  { type: 'command', text: '$ whoami' },
  { type: 'result', text: 'Chris Prempeh' },
  { type: 'command', text: '$ cat title.txt' },
  { type: 'result', text: 'Technical Manager' },
  { type: 'tagline', text: 'Developer currently building backend systems that are reliable, clean, and built to scale.' },
];

export default function TerminalIntro() {
  const [lines, setLines] = useState<{ type: string; text: string; done: boolean }[]>([]);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    // Skip animation on reduced motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadyPlayed = sessionStorage.getItem('terminal-intro-played');

    if (prefersReduced || alreadyPlayed) {
      setLines(sequence.map((l) => ({ ...l, done: true })));
      setAnimationDone(true);
      return;
    }

    let cancelled = false;

    async function animate() {
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

      // Initial pause with blinking cursor
      await sleep(600);

      for (let i = 0; i < sequence.length; i++) {
        if (cancelled) return;
        const line = sequence[i];

        if (line.type === 'command') {
          // Type command character by character
          setLines((prev) => [...prev, { type: 'command', text: '', done: false }]);
          for (let c = 0; c < line.text.length; c++) {
            if (cancelled) return;
            await sleep(50);
            setLines((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                type: 'command',
                text: line.text.slice(0, c + 1),
                done: false,
              };
              return updated;
            });
          }
          // Mark command as done
          setLines((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], done: true };
            return updated;
          });
          await sleep(300);
        } else if (line.type === 'result') {
          // Type result character by character
          setLines((prev) => [...prev, { type: 'result', text: '', done: false }]);
          for (let c = 0; c < line.text.length; c++) {
            if (cancelled) return;
            await sleep(35);
            setLines((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                type: 'result',
                text: line.text.slice(0, c + 1),
                done: false,
              };
              return updated;
            });
          }
          setLines((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], done: true };
            return updated;
          });
          await sleep(400);
        } else if (line.type === 'tagline') {
          // Type tagline character by character
          await sleep(200);
          setLines((prev) => [...prev, { type: 'tagline', text: '', done: false }]);
          for (let c = 0; c < line.text.length; c++) {
            if (cancelled) return;
            await sleep(20);
            setLines((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                type: 'tagline',
                text: line.text.slice(0, c + 1),
                done: false,
              };
              return updated;
            });
          }
          setLines((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], done: true };
            return updated;
          });
        }
      }

      setAnimationDone(true);
      sessionStorage.setItem('terminal-intro-played', 'true');
    }

    animate();

    return () => {
      cancelled = true;
    };
  }, []);

  // Blink cursor
  useEffect(() => {
    if (animationDone) return;
    const id = setInterval(() => setCursorVisible((v) => !v), 500);
    return () => clearInterval(id);
  }, [animationDone]);

  return (
    <div className="min-h-[180px] space-y-1">
      {lines.length === 0 && (
        <span className={`font-mono text-[var(--text-muted)] ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}>_</span>
      )}
      {lines.map((line, i) => {
        if (line.type === 'command') {
          return (
            <p key={i} className="font-mono text-sm text-[var(--text-muted)]">
              {line.text}
              {!line.done && (
                <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'}`}>_</span>
              )}
            </p>
          );
        }
        if (line.type === 'result') {
          if (i === 1) {
            // "Chris Prempeh" - render as h1
            return (
              <h1 key={i} className="text-6xl font-bold text-[var(--text-primary)]">
                {line.text}
                {!line.done && (
                  <span className={`font-mono text-4xl ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}>_</span>
                )}
              </h1>
            );
          }
          // "Technical Manager" - render as h2
          return (
            <h2 key={i} className="text-xl text-[var(--text-secondary)] mt-2">
              {line.text}
              {!line.done && (
                <span className={`font-mono ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}>_</span>
              )}
            </h2>
          );
        }
        if (line.type === 'tagline') {
          return (
            <p key={i} className="text-[var(--text-muted)] mt-4 text-base mb-10">
              {line.text}
              {!line.done && (
                <span className={`font-mono ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}>_</span>
              )}
            </p>
          );
        }
        return null;
      })}
      {/* Hidden h1 for SEO when animation hasn't shown name yet */}
      {lines.length < 2 && (
        <h1 className="sr-only">Chris Prempeh</h1>
      )}
    </div>
  );
}
