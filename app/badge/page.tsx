const STRINGS = {
  eyebrow: "BADGE PROGRAM",
  titlePart1: "Changemaker ",
  titlePart2: "Narrative Badge",
  subtitle: "Certifying organizations and writers who embody the language of everyone a changemaker.",
  comingSoonTitle: "Under Development",
  comingSoonText: "The Badge Program will launch in v0.2. It will allow organizations to submit their entire corporate communication corpus for automated diagnostic screening and receive an official Ashoka Changemaker Narrative Certification.",
};

export default function BadgePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {STRINGS.eyebrow}
        </p>
        <h1 className="mt-4 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl lg:text-5xl">
          {STRINGS.titlePart1}
          <span className="font-light italic text-accent">{STRINGS.titlePart2}</span>
        </h1>
        <p className="mt-2 max-w-prose font-sans text-lg leading-relaxed text-ink">
          {STRINGS.subtitle}
        </p>

        <div className="mt-12 border border-border bg-surface p-6 sm:p-8 rounded-sm">
          <div className="h-px w-8 bg-accent" aria-hidden="true" />
          <h2 className="mt-4 font-display text-2xl font-normal leading-tight text-ink">
            {STRINGS.comingSoonTitle}
          </h2>
          <p className="mt-3 max-w-prose font-sans text-sm leading-relaxed text-muted">
            {STRINGS.comingSoonText}
          </p>
        </div>
      </div>
    </main>
  );
}
