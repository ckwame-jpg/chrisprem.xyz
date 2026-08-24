"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { emit, on } from "@/lib/os/bus";
import { useInView } from "@/hooks/os/useInView";
import { useReducedMotion } from "@/hooks/os/useReducedMotion";

interface Hop {
  name: string;
  role: string;
  ms: number;
  glyph: string;
}

// Representative dev-machine timings for url-shortener's redirect path.
// NOT measured - typical local docker-compose latencies. To capture real
// numbers: `cd url-shortener && docker compose up` then
// `curl -w "%{time_total}\n" http://localhost:8000/<shortcode>` and take
// the median of 5–10 hits with warm caches. Replace the ms values below.
const HOPS: Hop[] = [
  { name: "client", role: "curl", ms: 0, glyph: "◉" },
  { name: "fastapi", role: "api", ms: 4, glyph: "π" },
  { name: "postgres", role: "shortcode lookup", ms: 2, glyph: "▤" },
  { name: "redis", role: "click enqueue", ms: 1, glyph: "◆" },
  { name: "response", role: "307 → location", ms: 1, glyph: "↩" },
];

const AUTO_REPLAY_MS = 9500;
const FIRST_PLAY_DELAY_MS = 700;

type HopState = { lit: boolean; ms: string };

const initialNodes = (): HopState[] => HOPS.map((_, i) => ({ lit: i === 0, ms: i === 0 ? "0 ms" : "-" }));

export default function RequestTrace() {
  const [nodes, setNodes] = useState<HopState[]>(initialNodes);
  const [linkProgress, setLinkProgress] = useState<number[]>(() => HOPS.slice(0, -1).map(() => 0));
  const [total, setTotal] = useState("- ms");
  const [status, setStatus] = useState<{ text: string; tone: "good" | "live" | "muted" }>({ text: "pending", tone: "muted" });
  const [reqId, setReqId] = useState("req_---");

  const reduceMotion = useReducedMotion();
  const timeoutsRef = useRef<number[]>([]);
  const playingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef);

  const clearTimers = () => {
    timeoutsRef.current.forEach(window.clearTimeout);
    timeoutsRef.current = [];
  };

  const play = useCallback(() => {
    if (playingRef.current) return;
    playingRef.current = true;
    clearTimers();

    setNodes(initialNodes());
    setLinkProgress(HOPS.slice(0, -1).map(() => 0));
    setTotal("… ms");
    setStatus({ text: "in-flight", tone: "live" });

    let cum = 0;
    let i = 0;

    const step = () => {
      if (i >= HOPS.length - 1) {
        setTotal(`${cum} ms`);
        setStatus({ text: "200 OK", tone: "good" });
        setReqId(`req_${Math.random().toString(36).slice(2, 8)}`);
        playingRef.current = false;
        return;
      }
      const linkIdx = i;
      const nextIdx = i + 1;
      const hop = HOPS[nextIdx];

      setLinkProgress((prev) => {
        const next = [...prev];
        next[linkIdx] = 100;
        return next;
      });

      const dur = 380 + Math.random() * 200;
      const t = window.setTimeout(() => {
        cum += hop.ms;
        setNodes((prev) => {
          const next = [...prev];
          next[nextIdx] = { lit: true, ms: `+${hop.ms} ms` };
          return next;
        });
        setTotal(`${cum} ms`);
        i = nextIdx;
        step();
      }, dur);
      timeoutsRef.current.push(t);
    };

    const start = window.setTimeout(step, 200);
    timeoutsRef.current.push(start);
  }, []);

  // Bus-driven replays (terminal `run`, vim) work regardless of scroll.
  useEffect(() => on("trace:replay", () => play()), [play]);

  // First play + auto-replay loop - parked while off-screen, tab-hidden,
  // or under reduced motion.
  useEffect(() => {
    if (reduceMotion) {
      setNodes(HOPS.map(() => ({ lit: true, ms: "-" })));
      setLinkProgress(HOPS.slice(0, -1).map(() => 100));
      setTotal(`${HOPS.reduce((s, h) => s + h.ms, 0)} ms`);
      setStatus({ text: "200 OK", tone: "good" });
      setReqId("req_static");
      return;
    }
    if (!inView) return;

    const initial = window.setTimeout(play, FIRST_PLAY_DELAY_MS);
    timeoutsRef.current.push(initial);

    let interval = window.setInterval(play, AUTO_REPLAY_MS);

    const onVis = () => {
      if (document.hidden) {
        window.clearInterval(interval);
      } else {
        interval = window.setInterval(play, AUTO_REPLAY_MS);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.clearInterval(interval);
      clearTimers();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [play, reduceMotion, inView]);

  const stageStyle = {
    gridTemplateColumns: HOPS.map(() => "auto").join(" 1fr "),
    gridTemplateRows: "auto auto",
  };

  const statusColor = status.tone === "live" ? "var(--accent)" : status.tone === "good" ? "var(--good)" : "var(--fg-3)";

  return (
    <div
      ref={rootRef}
      className="trace"
      onMouseEnter={() => emit("trace:hover", { active: true })}
      onMouseLeave={() => emit("trace:hover", { active: false })}
    >
      <div className="trace-head">
        <div className="cmd">
          <b>$ curl</b> -w &quot;%{`{time_total}`}&quot; http://localhost:8000/xK4mP2v
        </div>
        <button type="button" className="replay" onClick={play} aria-label="replay request trace">
          replay ↻
        </button>
      </div>
      <div className="trace-stage" style={stageStyle}>
        {HOPS.map((hop, i) => (
          <div key={`${hop.name}-${i}`} style={{ display: "contents" }}>
            <div className={`trace-node${nodes[i]?.lit ? " lit" : ""}`}>
              <div className="icon">{hop.glyph}</div>
              <div className="name">{hop.name}</div>
              <div className="ms">{nodes[i]?.ms ?? "-"}</div>
            </div>
            {i < HOPS.length - 1 && (
              <div className="trace-link" style={{ ["--p" as never]: `${linkProgress[i] ?? 0}%` }} />
            )}
          </div>
        ))}
        {/* sub-line under hop 4 (redis) showing the async celery side-channel.
            gridColumn 7 = redis's column with 5 hops (auto 1fr auto 1fr auto 1fr [auto] 1fr auto). */}
        <div className="trace-async" style={{ gridColumn: "7 / -1", gridRow: 2 }}>
          <span className="branch">└──→</span> celery worker → postgres <span className="note">(async,&nbsp;non-blocking)</span>
        </div>
      </div>
      <div className="trace-foot">
        <div>
          x-request-id: <b>{reqId}</b>
        </div>
        <div>
          total: <b>{total}</b> ·{" "}
          <span className="status" style={{ color: statusColor }}>
            {status.text}
          </span>
        </div>
      </div>
    </div>
  );
}
