import { motion } from "framer-motion";
import type { SkillCategory } from "@/lib/v1/home-content";

interface SkillsSectionProps {
  categories: SkillCategory[];
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function SkillsSection({ categories }: SkillsSectionProps) {
  return (
    <section id="skills" className="scroll-mt-16 border-t border-[var(--border-subtle)] pt-10">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-5">skills</h2>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {categories.map((category) => (
          <motion.div
            key={category.title}
            variants={staggerItem}
            className="rounded-lg px-6 py-5 border border-[var(--border-subtle)] bg-[var(--card-bg)] backdrop-blur-md"
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">{category.title}</h3>
            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 text-sm rounded-full border border-[var(--border-tag)] bg-[var(--card-bg)] text-[var(--text-secondary)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
