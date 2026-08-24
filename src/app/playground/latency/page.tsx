import Link from "next/link";
import Hud from "@/components/os/Hud";
import LatencyGlobe from "@/components/LatencyGlobe";

export const metadata = {
  title: "Latency globe · chrisprem.xyz",
  description:
    "Representative round-trip times to the habitual-habits API from 9 cities on a 3D globe - plus your own RTT, measured live from your browser.",
  alternates: { canonical: "/playground/latency" },
};

export default function LatencyPage() {
  return (
    <>
      <Hud />
      <main className="shell">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 24,
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--fg-3)",
            letterSpacing: "0.06em",
          }}
        >
          <Link
            href="/"
            style={{
              color: "var(--accent)",
              borderBottom: "1px dashed currentColor",
            }}
          >
            ← cd ~
          </Link>
          <span>/playground/latency · zoom-in</span>
        </div>
        <LatencyGlobe />
      </main>
    </>
  );
}
