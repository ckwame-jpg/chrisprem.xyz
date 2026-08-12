"use client";

import { useSyncExternalStore } from "react";

/**
 * Real round-trip time to this site's own origin, measured from the
 * visitor's browser: median of 3 timed fetches to /api/ping, re-sampled
 * every 45s while the tab is visible. One module-level sampler no matter
 * how many components subscribe; `getServerSnapshot` returns null so
 * every consumer renders its fallback deterministically during SSR and
 * hydration.
 */

const SAMPLE_COUNT = 3;
const SAMPLE_GAP_MS = 300;
const RESAMPLE_MS = 45_000;

let current: number | null = null;
let started = false;
const listeners = new Set<() => void>();

function publish(value: number) {
  current = Math.min(999, Math.max(1, Math.round(value)));
  listeners.forEach((fn) => fn());
}

async function sampleOnce(): Promise<number | null> {
  try {
    const t0 = performance.now();
    const res = await fetch("/api/ping", { cache: "no-store" });
    if (!res.ok && res.status !== 204) return null;
    return performance.now() - t0;
  } catch {
    return null;
  }
}

async function measure() {
  if (document.visibilityState !== "visible") return;
  const samples: number[] = [];
  for (let i = 0; i < SAMPLE_COUNT; i += 1) {
    const sample = await sampleOnce();
    if (sample != null) samples.push(sample);
    if (i < SAMPLE_COUNT - 1) await new Promise((resolve) => setTimeout(resolve, SAMPLE_GAP_MS));
  }
  if (!samples.length) return;
  samples.sort((a, b) => a - b);
  publish(samples[Math.floor(samples.length / 2)]);
}

function start() {
  if (started) return;
  started = true;
  void measure();
  window.setInterval(measure, RESAMPLE_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && current == null) void measure();
  });
}

function subscribe(fn: () => void): () => void {
  start();
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const getSnapshot = () => current;
const getServerSnapshot = () => null;

export function useMeasuredRtt(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Inline measured-RTT number with a deterministic fallback (for text embeds). */
export function RttMs({ fallback = 28 }: { fallback?: number }) {
  const measured = useMeasuredRtt();
  return <>{measured ?? fallback}</>;
}
