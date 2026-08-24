import { mulberry32 } from "./prng";

/**
 * The one uptime story every surface tells: the chart, the legend, the
 * section header, the terminal `uptime` command, and uptime.log all read
 * from here. Synthetic, but internally consistent - the percentages are
 * derived from the incident, not invented next to it.
 */
export const UPTIME_STORY = {
  windowDays: 60,
  incident: {
    daysAgo: 21,
    durationLabel: "4m23s",
    durationSec: 263,
    timeUtc: "03:42",
    cause: "db failover",
  },
  warnDaysAgo: [9, 34],
  slo: 0.999,
} as const;

export type CellStatus = "good" | "warn" | "bad";

export interface UptimeCell {
  status: CellStatus;
  latency: string;
  daysAgo: number;
}

const WINDOW_SEC = UPTIME_STORY.windowDays * 86400;

/** Time-based availability: one 4m23s incident over the window. */
export function uptimePct(): string {
  return (100 * (1 - UPTIME_STORY.incident.durationSec / WINDOW_SEC)).toFixed(2);
}

/** With a single incident, MTTR is that incident's duration. */
export function mttrLabel(): string {
  return UPTIME_STORY.incident.durationLabel;
}

export function incidentCount(): number {
  return 1;
}

/** Percent of the SLO error budget still unspent over the window. */
export function errorBudgetPct(): number {
  const allowedSec = (1 - UPTIME_STORY.slo) * WINDOW_SEC;
  return Math.round(100 * (1 - UPTIME_STORY.incident.durationSec / allowedSec));
}

/**
 * Real calendar date for the incident, derived from "N days ago".
 * Uses the clock - only call from client event handlers or terminal
 * output (never in anything that appears in server-rendered HTML).
 */
export function incidentDateUtc(now: Date = new Date()): string {
  const d = new Date(now.getTime() - UPTIME_STORY.incident.daysAgo * 86400000);
  return `${d.toISOString().slice(0, 10)} ${UPTIME_STORY.incident.timeUtc} UTC`;
}

/**
 * Deterministic cells: same output on the server, on every client, for
 * every visitor. Dates are intentionally absent - compute them at
 * hover-time so the SSR HTML stays clock-free.
 */
export function buildCells(): UptimeCell[] {
  const rand = mulberry32(0xc0ffee);
  const warnDays: readonly number[] = UPTIME_STORY.warnDaysAgo;
  return Array.from({ length: UPTIME_STORY.windowDays }, (_, idx) => {
    const daysAgo = UPTIME_STORY.windowDays - 1 - idx;
    if (daysAgo === UPTIME_STORY.incident.daysAgo) {
      return {
        status: "bad" as const,
        latency: `${UPTIME_STORY.incident.durationLabel} downtime`,
        daysAgo,
      };
    }
    if (warnDays.includes(daysAgo)) {
      return { status: "warn" as const, latency: `p99 ${200 + Math.floor(rand() * 40)}ms`, daysAgo };
    }
    return { status: "good" as const, latency: `p99 ${110 + Math.floor(rand() * 50)}ms`, daysAgo };
  });
}
