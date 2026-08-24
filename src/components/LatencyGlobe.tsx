"use client";

/**
 * LatencyGlobe
 * -----------------------------------------------------------
 * Drop into a new playground page at:
 *   src/app/playground/latency/page.tsx
 *
 * Example usage (that page):
 *   import LatencyGlobe from "@/components/LatencyGlobe";
 *   export default function Page() {
 *     return <div className="min-h-screen px-6 md:px-28 pt-36 md:pt-20">
 *       <LatencyGlobe />
 *     </div>;
 *   }
 *
 * CITIES below is representative demo data (labeled as such in the UI -
 * the only live number is the visitor's own measured RTT). To wire real
 * per-city data, swap CITIES with a fetch('/api/uptime') response of the
 * same shape.
 *
 * Requires: npm i three @types/three
 * -----------------------------------------------------------
 */

import { useEffect, useRef } from "react";
import type { Line, Material, Mesh, MeshBasicMaterial } from "three";
import { useMeasuredRtt } from "@/hooks/os/useMeasuredRtt";

type City = { n: string; lat: number; lon: number; ms: number; ok: boolean };

const CITIES: City[] = [
  { n: "New York", lat: 40.71, lon: -74.0, ms: 42, ok: true },
  { n: "London", lat: 51.51, lon: -0.13, ms: 128, ok: true },
  { n: "Frankfurt", lat: 50.11, lon: 8.68, ms: 142, ok: true },
  { n: "Tokyo", lat: 35.69, lon: 139.69, ms: 220, ok: true },
  { n: "Sydney", lat: -33.87, lon: 151.21, ms: 310, ok: true },
  { n: "Lagos", lat: 6.52, lon: 3.38, ms: 196, ok: true },
  { n: "São Paulo", lat: -23.55, lon: -46.63, ms: 182, ok: true },
  { n: "Mumbai", lat: 19.07, lon: 72.87, ms: 272, ok: true },
  { n: "Nairobi", lat: -1.29, lon: 36.82, ms: 254, ok: true },
];

const AVG_MS = Math.round(CITIES.reduce((sum, c) => sum + c.ms, 0) / CITIES.length);
const MAX_MS = Math.max(...CITIES.map((c) => c.ms));

export default function LatencyGlobe() {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const measuredRtt = useMeasuredRtt();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const THREE = await import("three");
      if (cancelled || !canvasRef.current || !cardRef.current) return;

      const layer = canvasRef.current;
      const card = cardRef.current;
      const tooltip = tipRef.current!;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const w0 = layer.clientWidth;
      const h0 = layer.clientHeight;
      renderer.setSize(w0, h0);
      Object.assign(renderer.domElement.style, { position: "absolute", inset: "0" });
      layer.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(38, w0 / h0, 0.1, 100);
      camera.position.set(0.2, 1.2, 5.8);
      camera.lookAt(0, 0, 0);
      const scene = new THREE.Scene();

      scene.add(new THREE.AmbientLight(0x4060a0, 0.6));
      const key = new THREE.DirectionalLight(0xcfe0ff, 1.1);
      key.position.set(3, 4, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xa78bfa, 0.6);
      rim.position.set(-4, 0, -3);
      scene.add(rim);

      const g = new THREE.Group();
      scene.add(g);
      g.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(1.78, 48, 32),
          new THREE.MeshStandardMaterial({ color: 0x050d22, metalness: 0.3, roughness: 0.7 }),
        ),
      );
      const wire = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 40, 22),
        new THREE.MeshBasicMaterial({ color: 0x2a4580, wireframe: true, transparent: true, opacity: 0.35 }),
      );
      g.add(wire);
      const eq = new THREE.Mesh(
        new THREE.TorusGeometry(1.82, 0.005, 8, 128),
        new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.4 }),
      );
      eq.rotation.x = Math.PI / 2;
      g.add(eq);

      const pins = new THREE.Group();
      g.add(pins);
      const beamsG = new THREE.Group();
      g.add(beamsG);

      const latLonToVec = (lat: number, lon: number, r = 1.8) => {
        const phi = ((90 - lat) * Math.PI) / 180;
        const theta = ((lon + 180) * Math.PI) / 180;
        return new THREE.Vector3(
          -r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta),
        );
      };
      const colorFor = (ms: number, ok: boolean) => {
        if (!ok) return new THREE.Color(0xff5c5c);
        const t = Math.min(1, ms / 320);
        return new THREE.Color().setHSL(0.55 - t * 0.12, 0.85, 0.62);
      };

      const pinCaps: Mesh[] = [];
      CITIES.forEach((c) => {
        const base = latLonToVec(c.lat, c.lon, 1.81);
        const height = 0.15 + Math.min(0.8, c.ms / 450);
        const top = latLonToVec(c.lat, c.lon, 1.81 + height);
        const col = colorFor(c.ms, c.ok);
        const shaft = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.015, height, 8),
          new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.9 }),
        );
        shaft.position.copy(base.clone().lerp(top, 0.5));
        shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), base.clone().normalize());
        pins.add(shaft);
        const cap = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 16, 16),
          new THREE.MeshBasicMaterial({ color: col }),
        );
        cap.position.copy(top);
        cap.userData = { city: c };
        pinCaps.push(cap);
        pins.add(cap);
        const halo = new THREE.Mesh(
          new THREE.RingGeometry(0.08, 0.11, 24),
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
        );
        halo.position.copy(top);
        halo.lookAt(new THREE.Vector3(0, 0, 0));
        (halo.userData as { t0: number }).t0 = Math.random() * 10;
        pins.add(halo);
      });

      scene.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(2.0, 48, 32),
          new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.BackSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: { uColor: { value: new THREE.Color(0x7dd3fc) } },
            vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `varying vec3 vN; uniform vec3 uColor;
            void main(){ float f = pow(1.0 - abs(vN.z), 2.5); gl_FragColor = vec4(uColor, f*0.7); }`,
          }),
        ),
      );

      let dragging = false;
      let sx = 0;
      let sy = 0;
      let tx = 0;
      let ty = 0;
      let rx = 0;
      let ry = 0;
      const onDown = (e: PointerEvent) => {
        dragging = true;
        sx = e.clientX;
        sy = e.clientY;
        renderer.domElement.setPointerCapture(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        if (dragging) {
          const dx = e.clientX - sx;
          const dy = e.clientY - sy;
          sx = e.clientX;
          sy = e.clientY;
          ty += dx * 0.006;
          tx += dy * 0.006;
          tx = Math.max(-0.9, Math.min(0.9, tx));
        }
      };
      const onUp = () => {
        dragging = false;
      };
      renderer.domElement.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);

      const ray = new THREE.Raycaster();
      const mv = new THREE.Vector2();
      const onHover = (e: PointerEvent) => {
        const r = renderer.domElement.getBoundingClientRect();
        mv.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        mv.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        ray.setFromCamera(mv, camera);
        const hits = ray.intersectObjects(pinCaps);
        if (hits.length) {
          const c = (hits[0].object.userData as { city: City }).city;
          const cardR = card.getBoundingClientRect();
          tooltip.style.left = `${e.clientX - cardR.left}px`;
          tooltip.style.top = `${e.clientY - cardR.top}px`;
          tooltip.innerHTML = `
            <div class="city">${c.n}</div>
            <div class="${c.ok ? "ok" : "err"}">${c.ok ? "● healthy" : "● unreachable"}</div>
            <div>rtt: <span class="lat">${c.ms} ms</span></div>`;
          tooltip.classList.add("on");
        } else tooltip.classList.remove("on");
      };
      const onLeave = () => tooltip.classList.remove("on");
      renderer.domElement.addEventListener("pointermove", onHover);
      renderer.domElement.addEventListener("pointerleave", onLeave);

      type Beam = { line: Line; t0: number; dur: number };
      const beams: Beam[] = [];
      let nextBeam = 0;
      const spawnBeam = (t: number) => {
        const a = CITIES[Math.floor(Math.random() * CITIES.length)];
        const b = CITIES[Math.floor(Math.random() * CITIES.length)];
        if (a === b) return;
        const pa = latLonToVec(a.lat, a.lon, 1.82);
        const pb = latLonToVec(b.lat, b.lon, 1.82);
        const mid = pa
          .clone()
          .add(pb)
          .multiplyScalar(0.5)
          .normalize()
          .multiplyScalar(1.82 + pa.distanceTo(pb) * 0.35);
        const geo = new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(pa, mid, pb).getPoints(50));
        const mat = new THREE.LineBasicMaterial({ color: colorFor(a.ms, true), transparent: true, opacity: 0.95 });
        const line = new THREE.Line(geo, mat);
        beamsG.add(line);
        beams.push({ line, t0: t, dur: 1.6 });
      };

      const ro = new ResizeObserver(() => {
        const w = layer.clientWidth;
        const h = layer.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      });
      ro.observe(layer);

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let raf = 0;
      const tick = (now: number) => {
        const t = now / 1000;
        if (!reducedMotion) ty += 0.003 * 0.3;
        ry += (ty - ry) * 0.1;
        rx += (tx - rx) * 0.1;
        g.rotation.y = ry;
        g.rotation.x = rx;
        if (!reducedMotion) {
          pins.children.forEach((child) => {
            if ((child as Mesh).geometry?.type === "RingGeometry") {
              const m = child as Mesh;
              const t0 = (m.userData as { t0: number }).t0;
              const p = ((t - t0) % 2) / 2;
              m.scale.setScalar(1 + p * 1.4);
              (m.material as MeshBasicMaterial).opacity = 0.55 * (1 - p);
            }
          });
        }
        if (!reducedMotion && t > nextBeam) {
          spawnBeam(t);
          nextBeam = t + 0.35 + Math.random() * 0.6;
        }
        for (let i = beams.length - 1; i >= 0; i--) {
          const b = beams[i];
          const age = t - b.t0;
          if (age > b.dur) {
            beamsG.remove(b.line);
            b.line.geometry.dispose();
            (b.line.material as Material).dispose();
            beams.splice(i, 1);
          } else {
            (b.line.material as Material & { opacity: number }).opacity = 0.95 * (1 - age / b.dur);
          }
        }
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
        ro.disconnect();
        renderer.domElement.removeEventListener("pointerdown", onDown);
        renderer.domElement.removeEventListener("pointermove", onHover);
        renderer.domElement.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        scene.traverse((o) => {
          const mm = o as Mesh;
          mm.geometry?.dispose();
          const mat = mm.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        });
        renderer.dispose();
        layer.innerHTML = "";
      };
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="scroll-mt-16">
      <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
        <span className="text-sky-400">$</span> curl -w &quot;%&#123;time_total&#125;&quot; chrisprem.xyz/api/ping
      </div>
      <h1 className="text-5xl font-medium leading-none tracking-tight md:text-6xl">
        Latency <em className="font-normal italic text-sky-400">globe.</em>
      </h1>
      <p className="mt-4 max-w-lg text-[var(--text-secondary)]">
        Representative round-trip times to the{" "}
        <b className="font-medium text-[var(--text-primary)]">habitual-habits</b> API from 9 cities -
        demo data, not a live probe. The one real number is yours, measured from your browser.
        Pin height = RTT. Drag to rotate.
      </p>

      <div
        ref={cardRef}
        className="relative mt-10 overflow-hidden rounded-xl border border-[var(--border-subtle)]"
        style={{ height: 580, background: "rgba(0,8,24,0.4)", backdropFilter: "blur(8px)" }}
      >
        <div ref={canvasRef} className="absolute inset-0" style={{ touchAction: "none" }} />
        <div className="pointer-events-none absolute top-5 left-6 z-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#7dd3fc]" />
          Representative data · demo
        </div>
        <div className="absolute top-5 right-6 z-10 text-right font-mono text-[10px] tracking-[0.12em] text-[var(--text-muted)]">
          your rtt · measured
          <br />
          <b className="font-medium text-[var(--text-primary)]">
            {measuredRtt != null ? `${measuredRtt} ms` : "measuring…"}
          </b>
        </div>
        <div className="absolute right-6 bottom-5 left-6 z-10 flex justify-between gap-5 border-t border-[var(--border-subtle)] pt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
          <div className="flex-1">
            <b className="block font-sans text-xl font-medium tracking-tight text-green-400 normal-case">
              {CITIES.length}
            </b>
            cities plotted
          </div>
          <div className="flex-1">
            <b className="block font-sans text-xl font-medium tracking-tight text-[var(--text-primary)] normal-case">
              {AVG_MS} ms
            </b>
            avg rtt · demo
          </div>
          <div className="flex-1">
            <b className="block font-sans text-xl font-medium tracking-tight text-[var(--text-primary)] normal-case">
              {MAX_MS} ms
            </b>
            max rtt · demo
          </div>
          <div className="flex-1">
            <b className="block font-sans text-xl font-medium tracking-tight text-sky-300 normal-case">
              {measuredRtt != null ? `${measuredRtt} ms` : "-"}
            </b>
            your rtt · live
          </div>
        </div>
        <div
          ref={tipRef}
          className="globe-tooltip absolute z-20 whitespace-nowrap rounded-lg border border-[var(--border-subtle)] bg-[rgba(0,8,24,0.92)] px-3 py-2 font-mono text-[11px] opacity-0 transition-opacity pointer-events-none"
          style={{ transform: "translate(-50%, -100%) translateY(-10px)", backdropFilter: "blur(8px)" }}
        />
      </div>

      <style jsx>{`
        .globe-tooltip.on {
          opacity: 1;
        }
        .globe-tooltip :global(.city) {
          font-size: 13px;
          margin-bottom: 4px;
          font-family: var(--font-geist-sans, sans-serif);
          font-weight: 500;
        }
        .globe-tooltip :global(.lat) {
          color: #7dd3fc;
        }
        .globe-tooltip :global(.ok) {
          color: #67e866;
        }
        .globe-tooltip :global(.err) {
          color: #ff6b6b;
        }
      `}</style>
    </section>
  );
}
