"use client";

import { useEffect, useState } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, [role="button"], ' +
  ".arch-node, .arch-select button, .term-input, .term-suggest button, " +
  ".uptime .grid i, .magnet, .replay, .vim-suggest .row";

const RIPPLE_LIFE_MS = 600;

export function CursorEffects() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;

    let raf = 0;
    let mx = -200;
    let my = -200;

    const flush = () => {
      raf = 0;
      root.style.setProperty("--cursor-x", `${mx}px`);
      root.style.setProperty("--cursor-y", `${my}px`);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const target = e.target;
      const hot = target instanceof Element && !!target.closest(INTERACTIVE_SELECTOR);
      document.body.classList.toggle("cursor-hot", hot);
      if (!raf) raf = requestAnimationFrame(flush);
    };

    const onClick = (e: MouseEvent) => {
      if (reduced) return;
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, RIPPLE_LIFE_MS);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("click", onClick, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      document.body.classList.remove("cursor-hot");
    };
  }, []);

  return (
    <>
      <div className="cursor-halo" aria-hidden />
      {ripples.map((r) => (
        <div
          key={r.id}
          className="cursor-ripple"
          style={{ left: r.x, top: r.y }}
          aria-hidden
        />
      ))}
    </>
  );
}
