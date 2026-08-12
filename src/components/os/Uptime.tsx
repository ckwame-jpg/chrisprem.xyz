"use client";

import Link from "next/link";
import { useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";
import {
  UPTIME_STORY,
  buildCells,
  incidentCount,
  mttrLabel,
  uptimePct,
  type UptimeCell,
} from "@/lib/os/uptimeStory";

interface TipState {
  show: boolean;
  cell: UptimeCell | null;
  date: string;
  x: number;
  y: number;
}

const initialTip: TipState = { show: false, cell: null, date: "", x: 0, y: 0 };

// Clock only runs inside hover handlers, so server HTML stays deterministic.
function dateLabelFor(daysAgo: number): string {
  const date = new Date(Date.now() - daysAgo * 86400000);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Uptime() {
  const cells = useMemo(buildCells, []);
  const [tip, setTip] = useState<TipState>(initialTip);

  const incidents = incidentCount();
  const incidentNoun = incidents === 1 ? "incident" : "incidents";

  const onCellEnter = (cell: UptimeCell) => (event: ReactMouseEvent<HTMLElement>) => {
    setTip({
      show: true,
      cell,
      date: dateLabelFor(cell.daysAgo),
      x: event.clientX + 12,
      y: event.clientY - 38,
    });
  };
  const onCellMove = (event: ReactMouseEvent<HTMLElement>) => {
    setTip((prev) => ({ ...prev, x: event.clientX + 12, y: event.clientY - 38 }));
  };
  const onCellLeave = () => setTip(initialTip);

  return (
    <>
      <section className="uptime" aria-label="04 Uptime">
        <h3>Synthetic monitoring · chrisprem.xyz</h3>
        <div style={{ color: "var(--fg-3)", marginBottom: 14, fontSize: 12, lineHeight: 1.6 }}>
          One tick per day. Green = within SLO, amber = degraded, red = the pager went off.{" "}
          {incidents} {incidentNoun} in {UPTIME_STORY.windowDays} days; {mttrLabel()} to recovery.
          Write the postmortem, ship the fix, move on.
        </div>
        <div className="grid">
          {cells.map((cell, i) => (
            <i
              key={i}
              className={cell.status === "good" ? undefined : cell.status}
              onMouseEnter={onCellEnter(cell)}
              onMouseMove={onCellMove}
              onMouseLeave={onCellLeave}
            />
          ))}
        </div>
        <div className="legend">
          <span>{UPTIME_STORY.windowDays} days ago</span>
          <span>
            <b>{uptimePct()}%</b> uptime · <b>{mttrLabel()}</b> MTTR · <b>{incidents}</b>{" "}
            {incidentNoun}
          </span>
          <span>Today</span>
        </div>
        <Link className="uptime-globe-link" href="/playground/latency">
          → Zoom in: latency globe
        </Link>
      </section>

      <div className={`uptime-tip${tip.show ? " show" : ""}`} style={{ left: tip.x, top: tip.y }} aria-hidden>
        {tip.cell && (
          <>
            <b>{tip.date}</b>
            <span className="k">status</span>{" "}
            {tip.cell.status === "bad"
              ? "Incident"
              : tip.cell.status === "warn"
                ? "Degraded"
                : "Green"}
            <br />
            <span className="k">latency</span> {tip.cell.latency}
          </>
        )}
      </div>
    </>
  );
}
