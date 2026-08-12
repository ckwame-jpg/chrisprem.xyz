"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AboutSection from "@/components/v1/home/AboutSection";
import DesktopSidebar from "@/components/v1/home/DesktopSidebar";
import ExperienceSection from "@/components/v1/home/ExperienceSection";
import MobileNavbar from "@/components/v1/home/MobileNavbar";
import ProjectsSection from "@/components/v1/home/ProjectsSection";
import SkillsSection from "@/components/v1/home/SkillsSection";
import APIPlayground from "@/components/v1/APIPlayground";
import GitHubHeatmap from "@/components/v1/GitHubHeatmap";
import KonamiEasterEgg from "@/components/v1/KonamiEasterEgg";
import { useTheme } from "@/components/v1/ThemeProvider";
import VersionToggle from "@/components/os/VersionToggle";
import {
  experiences,
  projects,
  sections,
  skillCategories,
} from "@/lib/v1/home-content";

export default function V1Home() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("about");
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const move = (event: MouseEvent) => {
      const accent = getComputedStyle(main)
        .getPropertyValue("--bg-gradient-accent")
        .trim();
      const base = getComputedStyle(main)
        .getPropertyValue("--bg-gradient-base")
        .trim();
      main.style.background = `radial-gradient(circle at ${event.pageX}px ${event.pageY}px, ${accent} 0%, ${base} 45%)`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sectionRefs = sections.map((section) => ({
        id: section.id,
        element: document.getElementById(section.id),
      }));
      const scrollPosition = window.scrollY;
      for (let index = sectionRefs.length - 1; index >= 0; index -= 1) {
        const candidate = sectionRefs[index];
        if (candidate.element && scrollPosition >= candidate.element.offsetTop - window.innerHeight / 2) {
          setActiveSection(candidate.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={`v1-root ${theme} font-sans`}>
      <MobileNavbar
        sections={sections}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onScrollTo={scrollTo}
      />

      <main
        ref={mainRef}
        className="min-h-screen px-6 md:px-28 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-52 pt-36 md:pt-20 bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
      >
        <DesktopSidebar sections={sections} activeSection={activeSection} onScrollTo={scrollTo} />

        <div className="space-y-32">
          <AboutSection />
          <SkillsSection categories={skillCategories} />
          <ProjectsSection projects={projects} />

          <section
            id="playground"
            className="scroll-mt-16 border-t pt-10"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <h2 className="text-2xl font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
              playground
            </h2>
            <p className="text-base mb-4" style={{ color: "var(--text-secondary)" }}>
              Try out the APIs behind my projects. Switch between Habitual Habits and TaskBoard, pick an endpoint,
              and hit Run.
            </p>
            <Link href="/playground/latency" className="mb-4 inline-flex text-sky-400 hover:underline">
              → open latency globe
            </Link>
            <APIPlayground />
          </section>

          <ExperienceSection experiences={experiences} />

          <GitHubHeatmap />

          <div
            className="text-base mt-12 mb-12 md:pl-4 flex flex-wrap items-center justify-between gap-4"
            style={{ color: "var(--text-faint)" }}
          >
            <p>
              designed and built in VS Code. built with Next.js and Tailwind CSS, version controlled with GitHub,
              and deployed via Vercel. coded in TypeScript.
            </p>
            <VersionToggle active="v1" />
          </div>
        </div>
      </main>

      <KonamiEasterEgg />
    </div>
  );
}
