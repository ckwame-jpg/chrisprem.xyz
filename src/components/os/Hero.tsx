"use client";

import { useEffect, useRef, useState } from "react";
import HeroHeadline from "./HeroHeadline";
import MetaCell from "./MetaCell";
import RequestTrace from "./RequestTrace";
import { CosmosHeroSurface } from "@/components/cosmos/CosmosHeroSurface";
import { useMeasuredRtt } from "@/hooks/os/useMeasuredRtt";
import { useReducedMotion } from "@/hooks/os/useReducedMotion";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_PATH } from "@/lib/os/links";

interface BootRow {
  tag: string;
  msg: string;
}

const BOOT_LINES: BootRow[] = [
  { tag: "mounted", msg: "/portfolio" },
  { tag: "tls 1.3", msg: "handshake · 28ms rtt" },
  { tag: "7 services", msg: "online · 0 degraded" },
];

const SSH_TARGET = "visitor@chrisprem.xyz";
const TYPE_INTERVAL_MS = 26;

interface HeroProps {
  bio: string;
}

function useBootRibbon(reduceMotion: boolean) {
  const [shown, setShown] = useState<number>(reduceMotion ? BOOT_LINES.length : 0);
  const [dim, setDim] = useState<boolean>(reduceMotion);

  useEffect(() => {
    if (reduceMotion) return;
    const timers: number[] = [];
    BOOT_LINES.forEach((_, idx) => {
      timers.push(window.setTimeout(() => setShown(idx + 1), 140 * (idx + 1)));
    });
    timers.push(window.setTimeout(() => setDim(true), 140 * BOOT_LINES.length + 180));
    return () => timers.forEach(window.clearTimeout);
  }, [reduceMotion]);

  return { shown, dim };
}

function useTypedSsh(reduceMotion: boolean) {
  const [typed, setTyped] = useState(reduceMotion ? `ssh ${SSH_TARGET}` : "");
  const [showOk, setShowOk] = useState(reduceMotion);
  const [caretGone, setCaretGone] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) return;
    let cancelled = false;
    const timers: number[] = [];

    const fullCmd = `ssh ${SSH_TARGET}`;
    let idx = 0;

    const typeNext = () => {
      if (cancelled) return;
      if (idx >= fullCmd.length) {
        timers.push(
          window.setTimeout(() => {
            if (cancelled) return;
            setCaretGone(true);
            setShowOk(true);
          }, 220),
        );
        return;
      }
      idx += 1;
      setTyped(fullCmd.slice(0, idx));
      timers.push(window.setTimeout(typeNext, TYPE_INTERVAL_MS + (Math.random() * 14 - 7)));
    };

    timers.push(window.setTimeout(typeNext, 120));

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, [reduceMotion]);

  return { typed, showOk, caretGone };
}

export default function Hero({ bio }: HeroProps) {
  const reduceMotion = useReducedMotion();
  const { shown, dim } = useBootRibbon(reduceMotion);
  const { typed, showOk, caretGone } = useTypedSsh(reduceMotion);
  const heroRef = useRef<HTMLElement>(null);
  // Real measured round-trip; deterministic 28 fallback until the first sample.
  const rttMs = useMeasuredRtt() ?? 28;

  const sshHasArg = typed.startsWith("ssh ");
  const sshCmd = sshHasArg ? "ssh" : typed;
  const sshArg = sshHasArg ? typed.slice(4) : "";

  return (
    <section ref={heroRef} className="hero" aria-label="Hero · SSH banner">
      <CosmosHeroSurface />
      <div className={`boot${dim ? " dim" : ""}`}>
        {BOOT_LINES.map((line, idx) => (
          <div key={line.tag} className={`boot-row${idx < shown ? " in" : ""}`}>
            <span className="br">[</span> <span className="ok">ok</span> <span className="br">]</span>{" "}
            <span style={{ color: "var(--fg)" }}>{line.tag}</span>{" "}
            <span style={{ color: "var(--fg-3)" }}>
              · {line.tag === "tls 1.3" ? `handshake · ${rttMs}ms rtt` : line.msg}
            </span>
          </div>
        ))}
      </div>

      <div className="ssh">
        <span className="ssh-prompt">$</span>
        <span className="ssh-typed">
          {sshHasArg ? (
            <>
              <b>{sshCmd}</b>
              &nbsp;
              <span className="arg">{sshArg}</span>
            </>
          ) : (
            <b>{sshCmd}</b>
          )}
        </span>
        <span className={`ssh-caret${caretGone ? " gone" : ""}`} aria-hidden>
          ▌
        </span>
        <span className={`ssh-ok${showOk ? " show" : ""}`}>→ connected · tls 1.3 · {rttMs}ms</span>
      </div>

      <div className="hero-name">Chris Prempeh</div>
      <HeroHeadline primary="Software" italic="Engineer." />

      <p className="sub">{bio}</p>

      <nav className="hero-cta" aria-label="Profiles and contact">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          GitHub ↗
        </a>
        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
          LinkedIn ↗
        </a>
        <a href={RESUME_PATH} target="_blank" rel="noopener noreferrer">
          Resume ↗
        </a>
        <a href={`mailto:${EMAIL}`}>Email</a>
      </nav>

      <div className="meta">
        <MetaCell label="Full-stack" caption="backend · frontend · infra" />
        <MetaCell label="BS in Computer Science" caption="SNHU · Class of 2026" />
        <MetaCell label="Open" caption="to engineering roles" />
      </div>

      <RequestTrace />
    </section>
  );
}
