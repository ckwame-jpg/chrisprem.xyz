import { motion } from "framer-motion";
import { ExternalLinkIcon, GitHubIcon } from "@/components/v1/home/icons";
import type { ProjectItem } from "@/lib/v1/home-content";

interface ProjectCardProps {
  project: ProjectItem;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.div
      className="rounded-lg px-8 py-6 border border-[var(--border-subtle)] bg-[var(--card-bg)] backdrop-blur-md"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <h3 className="text-2xl font-bold text-[var(--text-primary)]">{project.title}</h3>
      <p className="text-[var(--text-secondary)] mt-2 text-base">{project.description}</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {project.tags.map((tag) => (
          <span key={tag} className="px-3 py-1 text-xs rounded-full border border-[var(--border-tag)] bg-[var(--card-bg)] text-[var(--tag-text)]">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center space-x-4 mt-4">
        {project.links.map((link) => (
          <a
            key={`${project.title}-${link.href}`}
            href={link.href}
            className="inline-block text-[var(--text-primary)] hover:opacity-80 transition-transform hover:scale-110"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
          >
            {link.type === "demo" ? <ExternalLinkIcon /> : <GitHubIcon />}
          </a>
        ))}
      </div>
    </motion.div>
  );
}
