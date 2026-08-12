export default function AboutSection() {
  return (
    <section id="about" className="scroll-mt-16 space-y-4 text-base sm:text-lg text-[var(--text-secondary)]">
      <p>
        I like building things that work well and stay up. Most of what I build runs on
        <span className="text-[var(--text-primary)]"> Python</span>,
        <span className="text-[var(--text-primary)]"> FastAPI</span>,
        <span className="text-[var(--text-primary)]"> Docker</span>, and
        <span className="text-[var(--text-primary)]"> PostgreSQL</span>, with a focus on clean APIs, solid auth,
        and infrastructure I can trust.
      </p>
      <p>
        I&apos;m wrapping up my <span className="text-[var(--text-primary)]">BS in Computer Science</span> and spending most
        of my free time building full-stack projects. Before this, I worked as a VAR Technical Manager keeping
        live broadcast systems running during MLS matches.
      </p>
      <p>
        I&apos;m looking for <span className="text-[var(--text-primary)]">backend or full-stack engineering roles</span>
        where I can ship real features and keep learning.
        <a
          href="https://www.linkedin.com/in/christopher-prempeh/"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-[var(--text-primary)] underline underline-offset-4 decoration-[var(--link-decoration)] hover:decoration-[var(--text-primary)] transition"
        >
          Let&apos;s connect on LinkedIn.
        </a>
      </p>
    </section>
  );
}
