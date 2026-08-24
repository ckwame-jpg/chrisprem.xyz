"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ARCH_DEFS, PROJECT_ORDER } from "./architecture/defs";
import { on } from "@/lib/os/bus";
import { useInView } from "@/hooks/os/useInView";
import { useReducedMotion } from "@/hooks/os/useReducedMotion";
import type { ArchEdgeKind, ArchNode, ProjectId } from "@/lib/os/types";

type Positions = Record<string, { x: number; y: number }>;

interface EdgePath {
  a: string;
  b: string;
  d: string;
  midX: number;
  midY: number;
  kind?: ArchEdgeKind;
  label?: string;
  inTrace?: boolean;
}

const PACKET_TICK_MS = 32;
const PROGRESS_STEP = 0.04;
const DRAG_MOVE_THRESHOLD_PX = 4;

function computeEdgePath(
  a: { x: number; y: number },
  b: { x: number; y: number },
): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const offset = Math.min(8, len * 0.08);
  const cx = mx + px * offset;
  const cy = my + py * offset;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

function positionsForProject(id: ProjectId): Positions {
  const result: Positions = {};
  ARCH_DEFS[id].nodes.forEach((n) => {
    result[n.id] = { x: n.x, y: n.y };
  });
  return result;
}

interface ArchitectureProps {
  initialProject?: ProjectId;
}

export default function Architecture({ initialProject = "habitual-habits" }: ArchitectureProps) {
  const [activeId, setActiveId] = useState<ProjectId>(initialProject);
  const [positions, setPositions] = useState<Positions>(() => positionsForProject(initialProject));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [traceCoupled, setTraceCoupled] = useState(false);

  const def = ARCH_DEFS[activeId];
  const canvasRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<SVGCircleElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef);
  const reduceMotion = useReducedMotion();

  // Measured canvas + node size → percentage clamp so edge nodes can't
  // hang outside the panel (the old static bounds clipped on phones).
  const [halfPct, setHalfPct] = useState({ x: 8, y: 6 });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nodeEl = canvas.querySelector<HTMLElement>(".arch-node");
      const nodeW = nodeEl?.offsetWidth ?? 150;
      const nodeH = nodeEl?.offsetHeight ?? 54;
      setHalfPct({
        x: Math.min(24, (nodeW / 2 / rect.width) * 100 + 1),
        y: Math.min(20, (nodeH / 2 / rect.height) * 100 + 1),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  const clampX = useCallback(
    (x: number) => Math.max(halfPct.x, Math.min(100 - halfPct.x, x)),
    [halfPct],
  );
  const clampY = useCallback(
    (y: number) => Math.max(halfPct.y, Math.min(100 - halfPct.y, y)),
    [halfPct],
  );

  // Nodes, edges, and the packet all draw from the same clamped coords.
  const displayPositions = useMemo(() => {
    const result: Positions = {};
    for (const [id, pos] of Object.entries(positions)) {
      result[id] = { x: clampX(pos.x), y: clampY(pos.y) };
    }
    return result;
  }, [positions, clampX, clampY]);

  const { edges, tracedNodeIds } = useMemo(() => {
    const built = def.edges
      .map((edge): EdgePath | null => {
        const [a, b, opts] = edge;
        const A = displayPositions[a];
        const B = displayPositions[b];
        if (!A || !B) return null;
        return {
          a,
          b,
          d: computeEdgePath(A, B),
          midX: (A.x + B.x) / 2,
          midY: (A.y + B.y) / 2,
          ...(opts?.kind && { kind: opts.kind }),
          ...(opts?.label && { label: opts.label }),
          ...(opts?.inTrace && { inTrace: opts.inTrace }),
        };
      })
      .filter((e): e is EdgePath => e !== null);
    const tracedNodeIds = new Set<string>();
    for (const e of built) {
      if (e.inTrace) {
        tracedNodeIds.add(e.a);
        tracedNodeIds.add(e.b);
      }
    }
    return { edges: built, tracedNodeIds };
  }, [def, displayPositions]);

  const switchProject = useCallback((id: ProjectId) => {
    setActiveId(id);
    setPositions(positionsForProject(id));
    setSelectedNodeId(null);
  }, []);

  // arch:focus event from terminal/vim
  useEffect(() => {
    return on("arch:focus", ({ project }) => {
      if (ARCH_DEFS[project]) {
        switchProject(project);
        sectionRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    });
  }, [switchProject]);

  // trace:hover coupling - only on url-shortener and only when device supports hover
  useEffect(() => {
    if (activeId !== "url-shortener") {
      setTraceCoupled(false);
      return;
    }
    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
      return;
    }
    return on("trace:hover", ({ active }) => setTraceCoupled(active));
  }, [activeId]);

  // packet animation along edges (direct DOM mutation, no re-render) -
  // parked while the section is off-screen or under reduced motion
  useEffect(() => {
    if (!inView || reduceMotion) return;
    const activeEdges = traceCoupled ? edges.filter((e) => e.inTrace) : edges;
    if (activeEdges.length === 0) return;
    let edgeIdx = 0;
    let progress = 0;
    let livePathEl: SVGPathElement | null = null;

    const tick = () => {
      const canvas = canvasRef.current;
      const packet = packetRef.current;
      if (!canvas || !packet) return;
      const cur = activeEdges[edgeIdx];
      if (!cur) return;
      const A = displayPositions[cur.a];
      const B = displayPositions[cur.b];
      if (!A || !B) return;
      const x = A.x + (B.x - A.x) * progress;
      const y = A.y + (B.y - A.y) * progress;
      packet.setAttribute("cx", String(x));
      packet.setAttribute("cy", String(y));

      const pathSelector = `path.arch-edge[data-edge="${cur.a}-${cur.b}"]`;
      const nextLive = canvas.querySelector<SVGPathElement>(pathSelector);
      if (nextLive !== livePathEl) {
        if (livePathEl) livePathEl.classList.remove("live");
        livePathEl = nextLive;
        if (livePathEl) livePathEl.classList.add("live");
      }
      progress += PROGRESS_STEP;
      if (progress >= 1) {
        if (livePathEl) {
          livePathEl.classList.remove("live");
          livePathEl = null;
        }
        progress = 0;
        edgeIdx = (edgeIdx + 1) % activeEdges.length;
      }
    };

    const id = window.setInterval(tick, PACKET_TICK_MS);
    return () => {
      window.clearInterval(id);
      if (livePathEl) livePathEl.classList.remove("live");
    };
  }, [edges, displayPositions, traceCoupled, inView, reduceMotion]);

  // Drag handling - Pointer Events with capture, so mouse and touch both
  // work and interrupted touches (pointercancel) can't leave a stuck drag.
  const dragRef = useRef<{
    nodeId: string;
    pointerId: number;
    startMx: number;
    startMy: number;
    startLeft: number;
    startTop: number;
    moved: boolean;
  } | null>(null);
  const justDraggedRef = useRef(false);

  const onPointerDownNode = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, node: ArchNode) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        nodeId: node.id,
        pointerId: event.pointerId,
        startMx: event.clientX,
        startMy: event.clientY,
        startLeft: positions[node.id]?.x ?? node.x,
        startTop: positions[node.id]?.y ?? node.y,
        moved: false,
      };
      event.currentTarget.classList.add("dragging");
    },
    [positions],
  );

  const onPointerMoveNode = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      const canvas = canvasRef.current;
      if (!drag || !canvas || event.pointerId !== drag.pointerId) return;
      const dxPx = event.clientX - drag.startMx;
      const dyPx = event.clientY - drag.startMy;
      if (!drag.moved && Math.hypot(dxPx, dyPx) > DRAG_MOVE_THRESHOLD_PX) drag.moved = true;
      if (!drag.moved) return;
      const rect = canvas.getBoundingClientRect();
      const nl = clampX(drag.startLeft + (dxPx / rect.width) * 100);
      const nt = clampY(drag.startTop + (dyPx / rect.height) * 100);
      setPositions((prev) => ({ ...prev, [drag.nodeId]: { x: nl, y: nt } }));
    },
    [clampX, clampY],
  );

  const onPointerEndNode = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    // A real drag suppresses the click-select that follows pointerup.
    justDraggedRef.current = drag.moved;
    dragRef.current = null;
    event.currentTarget.classList.remove("dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const selectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const onNodeKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>, nodeId: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectNode(nodeId);
      }
    },
    [selectNode],
  );

  const selectedNode = def.nodes.find((n) => n.id === selectedNodeId) ?? null;
  const hoveredId = hoveredNodeId;

  return (
    <div ref={sectionRef} id="arch">
      <div className="section-head">
        <div>
          <div className="num">03 / systems</div>
          <h2>Each project is a real system. Click around.</h2>
        </div>
        <div className="meta arch-select">
          {PROJECT_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              className={id === activeId ? "active" : ""}
              onClick={() => switchProject(id)}
            >
              {ARCH_DEFS[id].title}
            </button>
          ))}
        </div>
      </div>

      <section className="arch" aria-label="03 Architecture">
        <aside className="arch-side">
          <div>
            <div className="pid">project · live</div>
            <h3>{def.title}</h3>
            <div style={{ color: "var(--fg-3)", lineHeight: 1.5 }}>{def.tagline}</div>
            <div className="arch-links">
              {def.repo && (
                <a href={def.repo} target="_blank" rel="noopener noreferrer">
                  source: {def.repo.split("/").pop()} ↗
                </a>
              )}
              {def.live && (
                <a href={def.live} target="_blank" rel="noopener noreferrer">
                  live demo ↗
                </a>
              )}
            </div>
          </div>
          <div>
            {def.stats.map(([k, v]) => (
              <div key={k} className="stat">
                <span>{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>
          <div className="selected">
            {selectedNode ? (
              <>
                <div className="role">{selectedNode.role}</div>
                <h4>{selectedNode.label}</h4>
                <div style={{ color: "var(--fg-3)" }}>{selectedNode.desc}</div>
                <pre>{selectedNode.sample}</pre>
              </>
            ) : (
              <>
                <div className="role">click a node →</div>
                <h4>Or hover an edge</h4>
                <div style={{ color: "var(--fg-3)" }}>
                  Each box is a real component - click for the role, the why, and a representative
                  snippet.
                </div>
              </>
            )}
          </div>
        </aside>
        <div ref={canvasRef} className="arch-canvas">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            {edges.map((edge) => {
              const isLive =
                hoveredId !== null && (edge.a === hoveredId || edge.b === hoveredId);
              const isDimmed = traceCoupled && !edge.inTrace;
              const showLive = isLive && !isDimmed;
              const kindClass = edge.kind ? ` arch-edge-${edge.kind}` : "";
              const dimClass = isDimmed ? " dimmed" : "";
              return (
                <path
                  key={`${edge.a}-${edge.b}`}
                  className={`arch-edge${kindClass}${dimClass}${showLive ? " live" : ""}`}
                  data-edge={`${edge.a}-${edge.b}`}
                  d={edge.d}
                />
              );
            })}
            <circle ref={packetRef} className="arch-packet" r={0.9} cx={-10} cy={-10} />
          </svg>
          {edges.map((edge) =>
            edge.label ? (
              <div
                key={`label-${edge.a}-${edge.b}`}
                className="arch-edge-label"
                style={{ left: `${edge.midX}%`, top: `${edge.midY}%` }}
              >
                {edge.label}
              </div>
            ) : null,
          )}
          {def.nodes.map((node) => {
            const pos = displayPositions[node.id] ?? node;
            const isActive = selectedNodeId === node.id;
            const isDimmedNode = traceCoupled && !tracedNodeIds.has(node.id);
            return (
              <div
                key={node.id}
                data-node={node.id}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={`${node.label} · ${node.role}`}
                className={`arch-node${isActive ? " active" : ""}${isDimmedNode ? " dimmed" : ""}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onPointerDown={(e) => onPointerDownNode(e, node)}
                onPointerMove={onPointerMoveNode}
                onPointerUp={onPointerEndNode}
                onPointerCancel={onPointerEndNode}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId((cur) => (cur === node.id ? null : cur))}
                onClick={(e) => {
                  if (justDraggedRef.current) {
                    justDraggedRef.current = false;
                    return;
                  }
                  e.stopPropagation();
                  selectNode(node.id);
                }}
                onKeyDown={(e) => onNodeKeyDown(e, node.id)}
              >
                <b>{node.label}</b>
                <div className="role">{node.role}</div>
              </div>
            );
          })}
          <div className="hint hint-drag">Drag any node ⤤</div>
          <div className="hint hint-tap">Tap a node for details</div>
        </div>
      </section>
    </div>
  );
}
