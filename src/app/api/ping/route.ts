/**
 * Tiny latency probe for the measured-RTT readouts. Edge runtime so the
 * response comes from the region nearest the visitor — the number reflects
 * network round-trip, not a hop to a fixed serverless region.
 */
export const runtime = "edge";

function pong() {
  return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
}

export function GET() {
  return pong();
}

export function HEAD() {
  return pong();
}
