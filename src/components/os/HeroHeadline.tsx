"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/os/useReducedMotion";

const PROXIMITY_RANGE_PX = 240;
const STAGGER_MS = 28;

interface HeroHeadlineProps {
  primary: string;
  italic: string;
}

function buildChars(text: string, offset: number): React.ReactNode[] {
  return Array.from(text).map((ch, i) => (
    <span
      key={i}
      className="vf-char in"
      data-i={offset + i}
      style={{ animationDelay: `${(offset + i) * STAGGER_MS}ms` }}
    >
      {ch === " " ? " " : ch}
    </span>
  ));
}

export default function HeroHeadline({ primary, italic }: HeroHeadlineProps) {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const headline = headlineRef.current;
    if (!headline) return;

    let mx = -9999;
    let my = -9999;
    let pending = false;

    const update = () => {
      pending = false;
      const chars = headline.querySelectorAll<HTMLSpanElement>(".vf-char");
      chars.forEach((c) => {
        const r = c.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(mx - cx, my - cy);
        const t = Math.max(0, 1 - d / PROXIMITY_RANGE_PX);
        const wght = 400 + Math.round(t * 400);
        c.style.fontVariationSettings = `"wght" ${wght}`;
        c.style.transform = `translateY(${(-t * 4).toFixed(2)}px)`;
      });
    };

    const onMove = (event: MouseEvent) => {
      mx = event.clientX;
      my = event.clientY;
      if (!pending) {
        pending = true;
        requestAnimationFrame(update);
      }
    };

    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, [reduceMotion]);

  return (
    <h1 ref={headlineRef} aria-label={`${primary} ${italic}`}>
      <span className="line">
        <span className="vf-word">{buildChars(primary, 0)}</span>
      </span>
      <br />
      <em>
        <span className="vf-word">{buildChars(italic, primary.length)}</span>
      </em>
    </h1>
  );
}
