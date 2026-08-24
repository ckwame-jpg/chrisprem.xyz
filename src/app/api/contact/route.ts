import { NextResponse } from "next/server";
import { EMAIL } from "@/lib/os/links";

/**
 * The contact form's real backend. Sends mail through Resend's REST API
 * (plain fetch - no SDK dependency). With no RESEND_API_KEY configured it
 * returns an honest 503 telling the visitor to email directly, so the
 * site works in every deployment.
 *
 * Free-tier note: until a sending domain is verified, Resend only
 * delivers from onboarding@resend.dev to the address that owns the
 * Resend account - CONTACT_EMAIL must be that address.
 */

// Best-effort, per-instance rate limiting. Serverless instances don't
// share memory, so this only blunts bursts that land on a warm instance.
// The durable backstops are the honeypot, the size caps, and Resend's
// free-tier daily ceiling.
const PER_IP_LIMIT = 5;
const PER_IP_WINDOW_MS = 60 * 60 * 1000;
const GLOBAL_LIMIT = 20;
const GLOBAL_WINDOW_MS = 10 * 60 * 1000;

const perIpHits = new Map<string, number[]>();
const globalHits: number[] = [];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactBody {
  from?: unknown;
  subject?: unknown;
  body?: unknown;
  website?: unknown; // honeypot - real visitors never send this
}

function reply(status: number, requestId: string, payload: Record<string, unknown>) {
  return NextResponse.json(payload, { status, headers: { "x-request-id": requestId } });
}

async function hashIp(req: Request): Promise<string> {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest).slice(0, 8), (b) => b.toString(16).padStart(2, "0")).join("");
}

function pruneAndCount(hits: number[], windowMs: number, now: number): number {
  while (hits.length && now - hits[0] > windowMs) hits.shift();
  return hits.length;
}

function validate(data: ContactBody): { field: string; detail: string } | null {
  if (typeof data.from !== "string" || data.from.length > 320 || !EMAIL_RE.test(data.from)) {
    return { field: "from", detail: "must be a valid email address" };
  }
  if (typeof data.subject !== "string" || !data.subject.trim() || data.subject.trim().length > 200) {
    return { field: "subject", detail: "required, up to 200 characters" };
  }
  if (typeof data.body !== "string" || !data.body.trim() || data.body.trim().length > 5000) {
    return { field: "body", detail: "required, up to 5000 characters" };
  }
  return null;
}

export async function POST(req: Request) {
  const requestId = `req_${crypto.randomUUID().slice(0, 8)}`;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return reply(400, requestId, { ok: false, error: "invalid_json" });
  }
  const data = (raw ?? {}) as ContactBody;

  // Honeypot tripped: claim success, send nothing, don't tip off the bot.
  if (typeof data.website === "string" && data.website.length > 0) {
    return reply(202, requestId, {
      ok: true,
      id: requestId.replace("req_", "msg_"),
      received_at: new Date().toISOString(),
      will_reply: "usually < 24h",
    });
  }

  const invalid = validate(data);
  if (invalid) {
    return reply(422, requestId, { ok: false, error: "validation_failed", ...invalid });
  }
  const from = data.from as string;
  const subject = (data.subject as string).replace(/[\r\n]+/g, " ").trim();
  const message = (data.body as string).trim();

  const now = Date.now();
  const ipKey = await hashIp(req);
  const ipHits = perIpHits.get(ipKey) ?? [];
  if (
    pruneAndCount(ipHits, PER_IP_WINDOW_MS, now) >= PER_IP_LIMIT ||
    pruneAndCount(globalHits, GLOBAL_WINDOW_MS, now) >= GLOBAL_LIMIT
  ) {
    return reply(429, requestId, { ok: false, error: "rate_limited", retry_after: "1h" });
  }
  ipHits.push(now);
  perIpHits.set(ipKey, ipHits);
  globalHits.push(now);

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return reply(503, requestId, {
      ok: false,
      error: "mailer_not_configured",
      note: "The relay isn't wired up in this deployment yet - email me directly.",
      email: EMAIL,
    });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: "chrisprem.xyz <onboarding@resend.dev>",
        to: [process.env.CONTACT_EMAIL ?? EMAIL],
        reply_to: from,
        subject: `[chrisprem.xyz] ${subject}`,
        text: `${message}\n\n-\nSent via the chrisprem.xyz contact endpoint\nReply to: ${from}`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return reply(502, requestId, {
        ok: false,
        error: "upstream_mail_error",
        note: "The mail relay hiccuped - email me directly.",
        email: EMAIL,
      });
    }
    const sent = (await res.json()) as { id?: string };
    return reply(202, requestId, {
      ok: true,
      id: sent.id ?? requestId,
      received_at: new Date().toISOString(),
      reply_to: from,
      will_reply: "usually < 24h",
    });
  } catch {
    return reply(502, requestId, {
      ok: false,
      error: "upstream_mail_error",
      note: "The mail relay timed out - email me directly.",
      email: EMAIL,
    });
  }
}
