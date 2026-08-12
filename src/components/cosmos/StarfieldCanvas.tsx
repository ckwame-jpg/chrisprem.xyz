"use client";

import { useEffect, useRef } from "react";

interface SkyState {
  ox: number;
  oy: number;
  tx: number;
  ty: number;
}

interface Star {
  x0: number;
  y0: number;
  r: number;
  a: number;
  ph: number;
  sp: number;
  drift: number;
  depth: number;
  bloom: boolean;
  tint: string;
}

declare global {
  interface Window {
    __cosmosSky?: SkyState;
  }
}

export function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!window.__cosmosSky) {
      window.__cosmosSky = { ox: 0, oy: 0, tx: 0, ty: 0 };
    }
    const sky: SkyState = window.__cosmosSky;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let stars: Star[] = [];

    // Pre-rendered bloom sprites (one per tint). The previous version
    // allocated a radial gradient per bloom star per frame (~330/frame);
    // a 1→0 alpha sprite scaled by globalAlpha draws the identical ramp
    // for the cost of a drawImage.
    const TINTS = ["180,140,255", "140,220,255", "230,230,255"] as const;
    const SPRITE_SIZE = 64;
    const bloomSprites = new Map<string, HTMLCanvasElement>();
    for (const tint of TINTS) {
      const sprite = document.createElement("canvas");
      sprite.width = SPRITE_SIZE;
      sprite.height = SPRITE_SIZE;
      const spriteCtx = sprite.getContext("2d");
      if (!spriteCtx) continue;
      const half = SPRITE_SIZE / 2;
      const grad = spriteCtx.createRadialGradient(half, half, 0, half, half, half);
      grad.addColorStop(0, `rgba(${tint},1)`);
      grad.addColorStop(1, `rgba(${tint},0)`);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
      bloomSprites.set(tint, sprite);
    }

    function resize() {
      w = canvas!.width = window.innerWidth * dpr;
      h = canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";

      const count = Math.floor((window.innerWidth * window.innerHeight) / 700);
      stars = Array.from({ length: count }, () => ({
        x0: Math.random() * w,
        y0: Math.random() * h,
        r: Math.random() * 1.3 * dpr + 0.2 * dpr,
        a: Math.min(1, Math.random() * 0.975 + 0.286),
        ph: Math.random() * Math.PI * 2,
        sp: 0.0006 + Math.random() * 0.0018,
        drift: 0.3 + Math.random() * 1.4,
        depth: 0.2 + Math.random() * 1.0,
        bloom: Math.random() < 0.18,
        tint:
          Math.random() < 0.16
            ? "180,140,255"
            : Math.random() < 0.28
              ? "140,220,255"
              : "230,230,255",
      }));
    }

    let raf = 0;
    const t0 = performance.now();
    function frame(t: number) {
      const dt = t - t0;
      sky.ox += sky.ox * -0.012;
      const px = (sky.ox + sky.tx) * dpr;
      const py = (sky.oy + sky.ty) * dpr;

      ctx!.clearRect(0, 0, w, h);

      for (const s of stars) {
        const warpX = Math.sin(dt * 0.00015 + s.y0 * 0.0013) * s.drift * dpr;
        const warpY = Math.cos(dt * 0.00012 + s.x0 * 0.0011) * s.drift * dpr * 0.6;
        const x = s.x0 + warpX + px * s.depth;
        const y = s.y0 + warpY + py * s.depth;
        const tw = 0.55 + 0.45 * Math.sin(s.ph + dt * s.sp);
        const a = s.a * tw;
        if (s.bloom) {
          const sprite = bloomSprites.get(s.tint);
          if (sprite) {
            const radius = s.r * 7;
            ctx!.globalAlpha = a * 0.4;
            ctx!.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
          }
        }
        ctx!.globalAlpha = a;
        ctx!.fillStyle = `rgba(${s.tint},1)`;
        ctx!.beginPath();
        ctx!.arc(x, y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    const onMove = (e: MouseEvent) => {
      const cx = e.clientX / window.innerWidth - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;
      sky.tx = cx * 20;
      sky.ty = cy * 14;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="page-canvas" aria-hidden />;
}
