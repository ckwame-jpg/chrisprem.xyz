"use client";

import { useFps } from "@/hooks/os/useFps";
import { useMeasuredRtt } from "@/hooks/os/useMeasuredRtt";
import { useSyntheticTelemetry } from "@/hooks/os/useSyntheticTelemetry";

export default function Hud() {
  const { fps, pip } = useFps();
  const { rps, p99, rtt, heapMb, ws } = useSyntheticTelemetry();
  const measuredRtt = useMeasuredRtt();

  const pipClass = pip === "ok" ? "" : pip;

  return (
    <div className="hud" aria-label="Site telemetry HUD">
      <div className="left">
        <span className="pip">
          <i className={pipClass} />
          <b>Chris Prempeh · Software Engineer</b>
        </span>
        <span className="seg">
          <span className="label">tls</span>
          <b>1.3</b>
        </span>
      </div>
      <div className="center">
        <span className="seg">
          <span className="label">fps</span>
          <b>{fps ?? "-"}</b>
        </span>
        <span className="seg">
          <span className="label">req/s</span>
          <b>{Math.round(rps)}</b>
        </span>
        <span className="seg">
          <span className="label">p99</span>
          <b>{Math.round(p99)}</b>
          <span className="label">ms</span>
        </span>
        <span className="seg">
          <span className="label">rtt</span>
          <b>{measuredRtt ?? Math.round(rtt)}</b>
          <span className="label">ms</span>
        </span>
        <span className="seg">
          <span className="label">heap</span>
          <b>{heapMb.toFixed(1)} MB</b>
        </span>
        <span className="seg">
          <span className="label">ws</span>
          <span className="ws" aria-hidden>
            {ws.map((h, i) => (
              <span key={i} style={{ height: `${h}px` }} />
            ))}
          </span>
        </span>
      </div>
      <div className="right">
        <span className="seg vim-hint-chip">
          <span className="label">press</span>
          <kbd>:</kbd>
          <span className="label">for commands</span>
        </span>
        <span className="seg">
          <span className="label">session</span>
          <b>visitor@chrisprem</b>
        </span>
      </div>
    </div>
  );
}
