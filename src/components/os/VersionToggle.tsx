import Link from "next/link";

interface VersionToggleProps {
  active: "v1" | "v2";
}

export default function VersionToggle({ active }: VersionToggleProps) {
  return (
    <nav className="vtoggle" aria-label="portfolio version switcher">
      {active === "v1" ? (
        <span className="active" aria-current="page">v1</span>
      ) : (
        <Link href="/v1" prefetch={false}>v1</Link>
      )}
      {active === "v2" ? (
        <span className="active" aria-current="page">v2</span>
      ) : (
        <Link href="/" prefetch={false}>v2</Link>
      )}
    </nav>
  );
}
