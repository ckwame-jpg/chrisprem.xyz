"use client";

import { useEffect } from "react";

export function useScrollProgress(selector = ".section-head"): void {
  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const heads = document.querySelectorAll<HTMLElement>(selector);
      const vh = window.innerHeight;
      heads.forEach((head) => {
        const rect = head.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (vh - rect.top) / vh));
        head.style.setProperty("--p", `${(p * 100).toFixed(2)}%`);
      });
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [selector]);
}
