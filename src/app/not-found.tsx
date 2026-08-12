import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="shell"
      style={{
        minHeight: "calc(100vh - 36px)",
        display: "grid",
        placeItems: "center",
        textAlign: "left",
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 13,
          lineHeight: 1.7,
          color: "var(--fg-2)",
          maxWidth: 520,
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--fg-3)",
            marginBottom: 14,
          }}
        >
          err / 404
        </div>
        <h1
          style={{
            fontFamily: "var(--sans)",
            fontWeight: 500,
            fontSize: "clamp(36px, 4vw, 56px)",
            letterSpacing: "-0.02em",
            color: "var(--fg)",
            marginBottom: 20,
          }}
        >
          This page isn&apos;t in the filesystem.
        </h1>
        <pre
          style={{
            background: "var(--bg-deep)",
            border: "1px solid var(--line)",
            borderRadius: 6,
            padding: 14,
            margin: 0,
            color: "var(--fg-2)",
            fontSize: 12,
            whiteSpace: "pre-wrap",
          }}
        >
          <span style={{ color: "var(--fg)" }}>visitor</span>
          <span style={{ color: "var(--fg-3)" }}>@</span>
          <span style={{ color: "var(--accent-2)" }}>chrisprem.xyz</span>
          <span style={{ color: "var(--fg-3)" }}>:</span>
          <span style={{ color: "var(--good)" }}>~</span>
          <span style={{ color: "var(--accent)" }}>$ </span>
          cat the-page-you-asked-for
          {"\n"}
          <span style={{ color: "var(--bad)" }}>cat: the-page-you-asked-for: no such file</span>
          {"\n"}
          <span style={{ color: "var(--fg-3)" }}>{"// try: cd ~"}</span>
        </pre>
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: 18,
            padding: "8px 14px",
            border: "1px solid var(--accent)",
            borderRadius: 4,
            color: "var(--accent)",
            fontSize: 11,
            letterSpacing: "0.06em",
            textDecoration: "none",
          }}
        >
          ← cd ~
        </Link>
      </div>
    </main>
  );
}
