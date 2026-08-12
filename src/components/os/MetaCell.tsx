"use client";

import { useRef } from "react";
import { useMagnet } from "@/hooks/os/useMagnet";
import { useReducedMotion } from "@/hooks/os/useReducedMotion";

interface MetaCellProps {
  label: string;
  caption: string;
}

export default function MetaCell({ label, caption }: MetaCellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  useMagnet(ref, { disabled: reduceMotion });

  return (
    <div ref={ref} className="cell magnet">
      <b>{label}</b>
      {caption}
    </div>
  );
}
