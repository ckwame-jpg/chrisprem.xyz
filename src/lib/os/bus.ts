import type { ProjectId } from "./types";

export interface BusEvents {
  "trace:replay": void;
  "arch:focus": { project: ProjectId };
  "section:scroll": { id: string };
  "vim:open": void;
  "trace:hover": { active: boolean };
}

type Listener<K extends keyof BusEvents> = (payload: BusEvents[K]) => void;

const listeners = new Map<keyof BusEvents, Set<Listener<keyof BusEvents>>>();

export function on<K extends keyof BusEvents>(event: K, fn: Listener<K>): () => void {
  const set = listeners.get(event) ?? new Set();
  set.add(fn as Listener<keyof BusEvents>);
  listeners.set(event, set);
  return () => {
    set.delete(fn as Listener<keyof BusEvents>);
  };
}

export function emit<K extends keyof BusEvents>(
  event: K,
  ...args: BusEvents[K] extends void ? [] : [payload: BusEvents[K]]
): void {
  const set = listeners.get(event);
  if (!set) return;
  const payload = args[0] as BusEvents[K];
  for (const fn of set) {
    (fn as Listener<K>)(payload);
  }
}
