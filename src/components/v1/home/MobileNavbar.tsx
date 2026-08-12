import ThemeToggle from "@/components/v1/ThemeToggle";
import { GitHubIcon, LinkedInIcon } from "@/components/v1/home/icons";
import type { NavSection } from "@/lib/v1/home-content";

interface MobileNavbarProps {
  sections: NavSection[];
  menuOpen: boolean;
  setMenuOpen: (next: boolean) => void;
  onScrollTo: (id: string) => void;
}

export default function MobileNavbar({ sections, menuOpen, setMenuOpen, onScrollTo }: MobileNavbarProps) {
  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold text-[var(--text-primary)]">Chris Prempeh</span>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <a href="https://github.com/ckwame-jpg" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <GitHubIcon className="w-5 h-5 text-[var(--text-primary)] hover:opacity-80" />
          </a>
          <a
            href="https://www.linkedin.com/in/christopher-prempeh/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <LinkedInIcon className="w-5 h-5 text-[var(--text-primary)] hover:opacity-80" />
          </a>
          <button
            type="button"
            className="flex flex-col justify-between w-6 h-4 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            <span
              className={`h-0.5 w-full bg-[var(--text-primary)] transform transition duration-300 ease-in-out ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`}
            />
            <span
              className={`h-0.5 w-full bg-[var(--text-primary)] transition duration-300 ease-in-out ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`h-0.5 w-full bg-[var(--text-primary)] transform transition duration-300 ease-in-out ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
            />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-[var(--bg-primary)] z-40 border-t border-[var(--border-subtle)] px-6 py-6 space-y-4 text-[var(--text-primary)] text-base">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(event) => {
                event.preventDefault();
                onScrollTo(section.id);
                setMenuOpen(false);
              }}
              className="block hover:opacity-80 transition"
            >
              {section.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
