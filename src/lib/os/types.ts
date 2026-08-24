export type ProjectId =
  | "habitual-habits"
  | "url-shortener"
  | "taskboard"
  | "fantasy-tool"
  | "gh-stats";

export type HudPipState = "ok" | "warn" | "bad";

export interface ArchNode {
  id: string;
  label: string;
  role: string;
  x: number;
  y: number;
  desc: string;
  sample: string;
}

export type ArchEdgeKind = "rest" | "ws" | "async";

export interface ArchEdgeOpts {
  kind?: ArchEdgeKind;
  label?: string;
  inTrace?: boolean;
}

export type ArchEdge =
  | readonly [from: string, to: string]
  | readonly [from: string, to: string, opts: ArchEdgeOpts];

export interface ArchDef {
  id: ProjectId;
  title: string;
  tagline: string;
  stats: ReadonlyArray<readonly [label: string, value: string]>;
  nodes: ArchNode[];
  edges: ArchEdge[];
  /** GitHub repo URL - shown as "source: <slug>" in the side panel. */
  repo?: string;
  /** Live deployment URL, when one exists. */
  live?: string;
}
