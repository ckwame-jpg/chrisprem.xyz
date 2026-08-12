"use client";

import { useEffect, useState } from "react";

interface PerformanceWithMemory extends Performance {
  memory?: { usedJSHeapSize: number };
}

interface Telemetry {
  rps: number;
  p99: number;
  rtt: number;
  heapMb: number;
  ws: number[];
}

const WS_BARS = 14;
const TELEMETRY_TICK_MS = 800;
const MEM_TICK_MS = 1000;
const WS_TICK_MS = 600;
const INITIAL_WS = Array.from({ length: WS_BARS }, (_, i) => 6 + (i % 4) * 1.5);
const INITIAL_HEAP_MB = 38;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function readHeapMb(): number {
  const perf = performance as PerformanceWithMemory;
  if (perf.memory) {
    return perf.memory.usedJSHeapSize / 1048576;
  }
  return 38 + Math.sin(performance.now() / 4000) * 4 + Math.random() * 1.2;
}

export function useSyntheticTelemetry(): Telemetry {
  const [rps, setRps] = useState(47);
  const [p99, setP99] = useState(142);
  const [rtt, setRtt] = useState(32);
  const [heapMb, setHeapMb] = useState<number>(INITIAL_HEAP_MB);
  const [ws, setWs] = useState<number[]>(INITIAL_WS);

  useEffect(() => {
    setHeapMb(readHeapMb());
    setWs(Array.from({ length: WS_BARS }, () => 4 + Math.random() * 10));

    const telemetryTimer = window.setInterval(() => {
      setRps((prev) => clamp(prev + (Math.random() - 0.5) * 6, 12, 120));
      setP99((prev) => clamp(prev + (Math.random() - 0.5) * 14, 60, 280));
      setRtt((prev) => clamp(prev + (Math.random() - 0.5) * 3, 18, 60));
    }, TELEMETRY_TICK_MS);

    const memTimer = window.setInterval(() => setHeapMb(readHeapMb()), MEM_TICK_MS);

    const wsTimer = window.setInterval(() => {
      setWs((prev) => {
        const next = prev.slice(1);
        next.push(3 + Math.random() * 12);
        return next;
      });
    }, WS_TICK_MS);

    return () => {
      window.clearInterval(telemetryTimer);
      window.clearInterval(memTimer);
      window.clearInterval(wsTimer);
    };
  }, []);

  return { rps, p99, rtt, heapMb, ws };
}
