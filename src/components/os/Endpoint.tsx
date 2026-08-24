"use client";

import { Fragment, useState, type ReactNode } from "react";
import { JsonLine } from "./terminal/output";
import { EMAIL } from "@/lib/os/links";

const DEFAULT_BODY = `{
  "from": "you@yourcompany.com",
  "subject": "We're hiring - backend",
  "body": "We read your portfolio. When can you talk?"
}`;

const STATUS_TEXT: Record<number, string> = {
  202: "accepted",
  400: "bad request",
  422: "unprocessable content",
  429: "too many requests",
  502: "bad gateway",
  503: "service unavailable",
};

interface JsonResponseLine {
  key: string;
  node: ReactNode;
}

type ResponseState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; head: string; message: string }
  | { kind: "done"; lines: JsonResponseLine[] };

const idleResponse: ResponseState = { kind: "idle" };

export default function Endpoint() {
  const [body, setBody] = useState<string>(DEFAULT_BODY);
  const [response, setResponse] = useState<ResponseState>(idleResponse);

  const send = async () => {
    if (response.kind === "loading") return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      setResponse({ kind: "error", head: "HTTP/2 400 bad request", message: "invalid JSON" });
      return;
    }
    setResponse({ kind: "loading" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const requestId = res.headers.get("x-request-id");
      let payload: unknown;
      try {
        payload = await res.json();
      } catch {
        setResponse({
          kind: "error",
          head: "unexpected response",
          message: `something odd came back - email ${EMAIL} directly`,
        });
        return;
      }
      const statusText = STATUS_TEXT[res.status] ?? "";
      const lines: JsonResponseLine[] = [
        {
          key: "h1",
          node: (
            <span className="dim">
              HTTP/2 {res.status} {statusText}
            </span>
          ),
        },
      ];
      if (requestId) {
        lines.push({ key: "h2", node: <span className="dim">x-request-id: {requestId}</span> });
      }
      lines.push(
        { key: "h3", node: <span className="dim">content-type: application/json</span> },
        { key: "blank", node: <>&nbsp;</> },
      );
      JSON.stringify(payload, null, 2)
        .split("\n")
        .forEach((line, i) => lines.push({ key: `j${i}`, node: <JsonLine line={line} /> }));
      setResponse({ kind: "done", lines });
    } catch {
      setResponse({
        kind: "error",
        head: "connection failed",
        message: `couldn't reach /api/contact - email ${EMAIL} directly`,
      });
    }
  };

  return (
    <section id="endpoint" className="endpoint" aria-label="05 Contact endpoint">
      <div className="endpoint-head">
        <span className="verb">POST</span>
        <span className="url">https://chrisprem.xyz/api/contact</span>
        <span style={{ marginLeft: "auto" }}>v1 · stable</span>
      </div>
      <div className="endpoint-body">
        <div className="endpoint-req">
          <div className="label">request body</div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            spellCheck={false}
            aria-label="contact request body"
          />
          <button type="button" onClick={send} disabled={response.kind === "loading"}>
            {response.kind === "loading" ? "Sending…" : "Send request →"}
          </button>
        </div>
        <div className="endpoint-res">
          <div className="label">response</div>
          <pre>
            {response.kind === "idle" && (
              <span className="dim">
                ▸ Click &quot;Send request&quot; to fire a real POST to /api/contact.{"\n"}
                {"  "}It emails me - your address becomes the reply-to.{"\n"}
                {"  "}Nothing else is stored.
              </span>
            )}
            {response.kind === "loading" && <span className="dim">… connecting</span>}
            {response.kind === "error" && (
              <>
                <span className="dim">{response.head}</span>
                {"\n\n"}
                {"{ "}
                <span className="key">&quot;error&quot;</span>:{" "}
                <span className="str">&quot;{response.message}&quot;</span>
                {" }"}
              </>
            )}
            {response.kind === "done" &&
              response.lines.map((line, i) => (
                <Fragment key={line.key}>
                  <span className="row" style={{ animationDelay: `${i * 50}ms` }}>
                    {line.node}
                  </span>
                </Fragment>
              ))}
          </pre>
        </div>
      </div>
    </section>
  );
}
