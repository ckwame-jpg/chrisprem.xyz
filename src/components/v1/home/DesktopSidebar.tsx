import ThemeToggle from "@/components/v1/ThemeToggle";
import TerminalIntro from "@/components/v1/TerminalIntro";
import { GitHubIcon, LinkedInIcon, ResumeIcon } from "@/components/v1/home/icons";
import type { NavSection } from "@/lib/v1/home-content";

interface DesktopSidebarProps {
  sections: NavSection[];
  activeSection: string;
  onScrollTo: (id: string) => void;
}

export default function DesktopSidebar({ sections, activeSection, onScrollTo }: DesktopSidebarProps) {
  return (
    <div className="hidden md:flex flex-col sticky top-20 self-start pl-4 pb-20">
      <div className="flex flex-col items-start justify-start pt-0 space-y-1">
        <TerminalIntro />
        <div className="space-y-6 text-base text-[var(--text-muted)] font-medium">
          {sections.map((section) => (
            <div key={section.id} className="group flex items-center space-x-2">
              <span
                className={`h-px w-6 transition-all duration-300 ${
                  activeSection === section.id
                    ? "bg-[var(--text-primary)] w-8"
                    : "bg-[var(--nav-indicator)] group-hover:bg-[var(--text-primary)]"
                }`}
              />
              <a
                href={`#${section.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  onScrollTo(section.id);
                }}
                className={`transition-transform duration-300 hover:text-[var(--text-primary)] hover:scale-105 ${
                  activeSection === section.id ? "text-[var(--text-primary)] scale-105" : ""
                }`}
              >
                {section.label}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4 mt-12">
        <a href="https://github.com/ckwame-jpg" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <GitHubIcon className="w-6 h-6 text-[var(--text-primary)] hover:opacity-80 transition-transform hover:scale-110" />
        </a>
        <a
          href="https://www.linkedin.com/in/christopher-prempeh/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <LinkedInIcon className="w-6 h-6 text-[var(--text-primary)] hover:opacity-80 transition-transform hover:scale-110" />
        </a>
        <a
          href="/resume.pdf"
          download
          className="flex items-center space-x-1.5 px-3 py-1 border border-[var(--border-subtle)] rounded-full text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all hover:scale-105"
          aria-label="Download Resume"
        >
          <ResumeIcon />
          <span>Resume</span>
        </a>
        <ThemeToggle />
      </div>
    </div>
  );
}
