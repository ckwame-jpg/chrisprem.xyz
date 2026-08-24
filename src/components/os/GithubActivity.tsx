"use client";

import { useEffect, useState } from "react";
import { GITHUB_URL } from "@/lib/os/links";

interface DayData {
  date: string;
  count: number;
}

interface WeekData {
  days: DayData[];
}

type State =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "ready"; weeks: WeekData[]; total: number };

const WEEKS_SHOWN = 26;

function tier(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 8) return 3;
  return 4;
}

/** Same grid geometry as the loaded state, so no layout shift. */
function PlaceholderGrid() {
  return (
    <div className="ghact-grid" aria-hidden>
      {Array.from({ length: WEEKS_SHOWN }, (_, wi) => (
        <div key={wi} className="ghact-col">
          {Array.from({ length: 7 }, (_, di) => (
            <i key={di} className="t0" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Real GitHub contributions, via the existing /api/github/contributions
 * route. Degrades to a profile link when the route has no token.
 */
export default function GithubActivity() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/github/contributions")
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        return res.json();
      })
      .then((data: { totalContributions: number; weeks: WeekData[] }) => {
        if (cancelled) return;
        setState({
          kind: "ready",
          weeks: data.weeks.slice(-WEEKS_SHOWN),
          total: data.totalContributions,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={`ghact${state.kind === "loading" ? " ghact-loading" : ""}`} aria-label="GitHub activity">
      <div className="ghact-head">
        <h3>Live GitHub activity</h3>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          github.com/ckwame-jpg ↗
        </a>
      </div>
      {state.kind === "ready" ? (
        <div className="ghact-grid" aria-hidden>
          {state.weeks.map((week, wi) => (
            <div key={wi} className="ghact-col">
              {week.days.map((day) => (
                <i
                  key={day.date}
                  className={`t${tier(day.count)}`}
                  title={`${day.date} · ${day.count} contribution${day.count === 1 ? "" : "s"}`}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <PlaceholderGrid />
      )}
      <div className="ghact-foot">
        {state.kind === "ready" && (
          <>
            <b>{state.total.toLocaleString("en-US")}</b> contributions in the last 12 months · last{" "}
            {WEEKS_SHOWN} weeks shown
          </>
        )}
        {state.kind === "loading" && <>Loading contribution data…</>}
        {state.kind === "error" && (
          <>
            Live contribution data unavailable -{" "}
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              see it on GitHub ↗
            </a>
          </>
        )}
      </div>
    </section>
  );
}
