"use client";

import { useEffect, type RefObject } from "react";

interface MagnetOptions {
  pull?: number;
  disabled?: boolean;
}

export function useMagnet(
  ref: RefObject<HTMLElement | null>,
  { pull = 6, disabled = false }: MagnetOptions = {},
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;

    let raf = 0;

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const nx = (px - 0.5) * pull;
        const ny = (py - 0.5) * pull;
        el.style.transform = `translate(${nx.toFixed(2)}px, ${ny.toFixed(2)}px)`;
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = "translate(0, 0)";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [ref, pull, disabled]);
}
