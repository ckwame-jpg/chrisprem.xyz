"use client";

import { useEffect, useRef } from "react";
import type { BufferGeometry, Mesh, Points } from "three";

const OS_BG = 0x050d22;
const ACCENT = 0x9bbcff;
const STAR_OPACITY = 0.5;
const FOG_INTENSITY = 0.55;

export default function NebulaBackground() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    (async () => {
      const THREE = await import("three");
      if (cancelled || !host) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(OS_BG, 1);
      Object.assign(renderer.domElement.style, { position: "absolute", inset: "0" });
      host.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 8);
      const scene = new THREE.Scene();

      const makeStars = (n: number, size: number, spread: number, hue: number) => {
        const g = new THREE.BufferGeometry();
        const p = new Float32Array(n * 3);
        const c = new Float32Array(n * 3);
        const tmp = new THREE.Color();
        for (let i = 0; i < n; i++) {
          p[i * 3] = (Math.random() - 0.5) * spread;
          p[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.7;
          p[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.8 - 4;
          tmp.setHSL(hue + (Math.random() - 0.5) * 0.08, 0.6, 0.5 + Math.random() * 0.3);
          c[i * 3] = tmp.r;
          c[i * 3 + 1] = tmp.g;
          c[i * 3 + 2] = tmp.b;
        }
        g.setAttribute("position", new THREE.BufferAttribute(p, 3));
        g.setAttribute("color", new THREE.BufferAttribute(c, 3));
        const m = new THREE.PointsMaterial({
          size,
          vertexColors: true,
          transparent: true,
          opacity: STAR_OPACITY,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        return new THREE.Points(g, m);
      };
      const layers = [
        makeStars(300, 0.035, 30, 0.58),
        makeStars(560, 0.075, 40, 0.68),
        makeStars(200, 0.13, 50, 0.76),
      ];
      layers.forEach((l) => scene.add(l));

      const fogMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        uniforms: {
          uTime: { value: 0 },
          uAccent: { value: new THREE.Color(ACCENT) },
          uBase: { value: new THREE.Color(OS_BG) },
          uIntensity: { value: FOG_INTENSITY },
        },
        vertexShader: `varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
          varying vec3 vP; uniform float uTime; uniform vec3 uAccent, uBase; uniform float uIntensity;
          void main(){
            float d = length(vP)/7.0;
            float glow = smoothstep(1.0, 0.2, d) * (0.35 + 0.15*sin(uTime*0.25));
            gl_FragColor = vec4(mix(uBase, uAccent, glow*0.7), glow * 0.45 * uIntensity);
          }
        `,
      });
      const fog = new THREE.Mesh(new THREE.SphereGeometry(7, 32, 32), fogMat);
      scene.add(fog);

      const onResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        if (reduceMotion) renderer.render(scene, camera);
      };
      window.addEventListener("resize", onResize);

      const mouse = { tx: 0, ty: 0, x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
      };
      if (!reduceMotion) window.addEventListener("pointermove", onMove);

      let raf = 0;
      const speeds = [0.008, 0.015, 0.025];
      const par = [0.15, 0.3, 0.55];
      const tick = (now: number) => {
        const t = now / 1000;
        mouse.x += (mouse.tx - mouse.x) * 0.04;
        mouse.y += (mouse.ty - mouse.y) * 0.04;
        layers.forEach((l, i) => {
          l.rotation.y = t * speeds[i] * 0.5;
          l.position.x = mouse.x * par[i];
          l.position.y = mouse.y * par[i] * 0.7;
        });
        fogMat.uniforms.uTime.value = t;
        fog.position.x = mouse.x * 0.4;
        fog.position.y = mouse.y * 0.25;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };

      if (reduceMotion) {
        renderer.render(scene, camera);
      } else {
        raf = requestAnimationFrame(tick);
      }

      const vis = () => {
        if (reduceMotion) return;
        if (document.hidden) cancelAnimationFrame(raf);
        else raf = requestAnimationFrame(tick);
      };
      document.addEventListener("visibilitychange", vis);

      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", vis);
        scene.traverse((o) => {
          const m = o as Mesh | Points;
          (m.geometry as BufferGeometry | undefined)?.dispose();
          const mat = (m as Mesh).material;
          if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
          else mat?.dispose();
        });
        renderer.dispose();
        host.innerHTML = "";
      };
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
