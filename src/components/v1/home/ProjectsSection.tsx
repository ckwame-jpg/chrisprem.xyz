import ProjectCard from "@/components/v1/home/ProjectCard";
import type { ProjectItem } from "@/lib/v1/home-content";

interface ProjectsSectionProps {
  projects: ProjectItem[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projects" className="scroll-mt-16 border-t border-[var(--border-subtle)] pt-10 space-y-6">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)]">projects</h2>
      {projects.map((project) => (
        <ProjectCard key={project.title} project={project} />
      ))}
    </section>
  );
}
