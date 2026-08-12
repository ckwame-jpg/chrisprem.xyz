import type { ExperienceItem } from "@/lib/v1/home-content";

interface ExperienceSectionProps {
  experiences: ExperienceItem[];
}

export default function ExperienceSection({ experiences }: ExperienceSectionProps) {
  return (
    <section id="experience" className="scroll-mt-16 border-t border-[var(--border-subtle)] pt-10 pb-60">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">experience</h2>
      <div className="space-y-10 sm:ml-0 leading-loose">
        {experiences.map((experience) => (
          <div key={experience.title} className="grid sm:grid-cols-[150px_1fr] sm:gap-10 items-start">
            <p className="text-base text-[var(--text-muted)] mb-1 sm:mb-0">{experience.period}</p>
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">{experience.title}</h3>
              <p className="text-[var(--text-secondary)] text-base mt-1">{experience.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
