"use client";

import { useEffect, useState } from "react";
import type { HudPipState } from "@/lib/os/types";

interface FpsResult {
  /** Smoothed FPS, or null while warming up / right after a tab switch. */
  fps: number | null;
  pip: HudPipState;
}

const FPS_SAMPLE_INTERVAL_MS = 500;
const ROLLING_WINDOW = 3;

/**
 * Real FPS, but honest about its own noise: shows nothing until two
 * samples exist, averages a small rolling window, and resets on tab
 * visibility changes - so the HUD never flashes "fps 3" just because the
 * page was loading or the tab was throttled in the background.
 */
export function useFps(): FpsResult {
  const [fps, setFps] = useState<number | null>(null);

  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    let samples: number[] = [];

    const loop = () => {
      frames += 1;
      const now = performance.now();
      if (now - last >= FPS_SAMPLE_INTERVAL_MS) {
        const next = Math.round((frames * 1000) / (now - last));
        samples.push(Math.min(120, Math.max(1, next)));
        if (samples.length > ROLLING_WINDOW) samples.shift();
        if (samples.length >= 2) {
          setFps(Math.round(samples.reduce((sum, s) => sum + s, 0) / samples.length));
        }
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      samples = [];
      setFps(null);
      frames = 0;
      last = performance.now();
    };

    raf = requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const pip: HudPipState = fps == null || fps >= 50 ? "ok" : fps >= 30 ? "warn" : "bad";
  return { fps, pip };
}
