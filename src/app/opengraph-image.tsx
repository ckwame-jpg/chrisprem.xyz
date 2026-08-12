import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { mulberry32 } from "@/lib/os/prng";

/**
 * Social share card, generated at build time. Terminal-styled to match
 * the site: starfield, boot rows, ssh prompt, name. Satori constraints
 * apply here — flexbox only, no CSS vars, inline hex colors.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Chris Prempeh · Software Engineer — chrisprem.xyz";

const FG = "#f5f5f5";
const DIM = "rgba(245,245,245,0.55)";
const FAINT = "rgba(245,245,245,0.4)";
const ACCENT = "#7dd3fc";
const GOOD = "#67e866";

function BootRow({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ color: FAINT }}>[</span>
      <span style={{ color: GOOD, margin: "0 10px" }}>ok</span>
      <span style={{ color: FAINT }}>]</span>
      <span style={{ marginLeft: 14, color: DIM }}>{text}</span>
    </div>
  );
}

export default async function OgImage() {
  let fonts:
    | { name: string; data: ArrayBuffer; style: "normal"; weight: 400 }[]
    | undefined;
  try {
    // This route is prerendered at build time on the Node runtime, where
    // fetch(file://) is unavailable — read the committed TTF directly.
    const file = await readFile(join(process.cwd(), "src/app/_og/GeistMono-Regular.ttf"));
    const data = file.buffer.slice(
      file.byteOffset,
      file.byteOffset + file.byteLength,
    ) as ArrayBuffer;
    fonts = [{ name: "Geist Mono", data, style: "normal", weight: 400 }];
  } catch {
    // Ship the card with satori's default font rather than fail the build.
    fonts = undefined;
  }

  const rand = mulberry32(42);
  const stars = Array.from({ length: 70 }, () => ({
    left: Math.round(rand() * 1200),
    top: Math.round(rand() * 630),
    size: 1.5 + rand() * 2,
    opacity: 0.2 + rand() * 0.55,
  }));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          backgroundColor: "#050a18",
          fontFamily: fonts ? "Geist Mono" : "monospace",
        }}
      >
        {stars.map((star, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              position: "absolute",
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              borderRadius: 9999,
              backgroundColor: "#e6e6ff",
              opacity: star.opacity,
            }}
          />
        ))}
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 28,
            top: 28,
            right: 28,
            bottom: 28,
            border: "1px solid rgba(125,211,252,0.28)",
            borderRadius: 18,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: 66,
            marginLeft: 84,
            fontSize: 21,
          }}
        >
          <BootRow text="mounted · /portfolio" />
          <BootRow text="7 services · online · 0 degraded" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 84, marginTop: 64 }}>
          <div style={{ display: "flex", fontSize: 27, color: ACCENT }}>
            $ ssh visitor@chrisprem.xyz
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              color: FG,
              marginTop: 20,
              letterSpacing: -3,
            }}
          >
            Chris Prempeh
          </div>
          <div style={{ display: "flex", fontSize: 42, color: ACCENT, marginTop: 4 }}>
            Software Engineer
          </div>
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 84,
            bottom: 62,
            fontSize: 21,
            color: DIM,
          }}
        >
          chrisprem.xyz · the site is the portfolio piece
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
