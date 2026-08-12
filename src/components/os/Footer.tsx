import VersionToggle from "./VersionToggle";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_PATH } from "@/lib/os/links";

interface FooterProps {
  version?: "v1" | "v2";
}

export default function Footer({ version = "v2" }: FooterProps) {
  return (
    <footer className="foot">
      <div>chrisprem.xyz · the site is the portfolio piece</div>
      <nav className="foot-links" aria-label="Profiles and contact">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a href={`mailto:${EMAIL}`}>Email</a>
        <a href={RESUME_PATH} target="_blank" rel="noopener noreferrer">
          Resume
        </a>
      </nav>
      <VersionToggle active={version} />
      <div>
        Built with <b>Next.js</b> · <b>Three.js</b> · vanilla CSS
      </div>
    </footer>
  );
}
