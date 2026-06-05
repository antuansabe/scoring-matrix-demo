const STRINGS = {
  eyebrow: "An instrument from Ashoka · Framework Change",
  titlePart1: "LEARN HOW YOUR LANGUAGE ",
  titlePart2: "reflects your changemaking worldview",
  subtitle: "This tool measures the architecture of language and what is behind the words you choose. It is anchored in critical discourse analysis and Ashoka's framework with the intention to help you notice the framing, grammar, and narrative positioning of what you say, in five dimensions.",
};

export function Hero() {
  return (
    <section className="pb-10 pt-12 sm:pb-12 sm:pt-16">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        {STRINGS.eyebrow}
      </p>
      <h1 className="mt-4 max-w-4xl font-display text-3xl font-normal leading-[1.1] text-ink sm:text-4xl lg:text-5xl uppercase tracking-tight">
        {STRINGS.titlePart1}
        <span className="font-light italic text-accent block sm:inline">
          {STRINGS.titlePart2}
        </span>
      </h1>
      <div className="mt-5 max-w-[65ch] space-y-5">
        <p className="font-sans text-[1.0625rem] leading-[1.6] text-ink">
          {STRINGS.subtitle}
        </p>
      </div>
    </section>
  );
}
