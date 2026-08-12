'use client';
import { useEffect, useRef, useState } from 'react';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export default function KonamiEasterEgg() {
  const [triggered, setTriggered] = useState(false);
  const progressRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const prev = progressRef.current;
      if (e.key === KONAMI[prev]) {
        const next = prev + 1;
        if (next === KONAMI.length) {
          setTriggered(true);
          progressRef.current = 0;
        } else {
          progressRef.current = next;
        }
      } else {
        progressRef.current = e.key === KONAMI[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!triggered) return;
    const timeout = setTimeout(() => setTriggered(false), 3000);
    return () => clearTimeout(timeout);
  }, [triggered]);

  if (!triggered) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
      <div
        className="bg-[var(--card-bg)] backdrop-blur-md border border-[var(--border-subtle)] rounded-xl px-8 py-6 text-center"
        style={{ animation: 'fadeIn 0.3s ease-out, fadeOut 0.5s ease-in 2.5s forwards' }}
      >
        <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">
          You found the secret!
        </p>
        <p className="text-[var(--text-muted)] text-sm font-mono">
          achievement unlocked: konami master
        </p>
      </div>
    </div>
  );
}
