const STRINGS = {
  eyebrow: "An instrument from Ashoka · Framework Change",
  titlePart1: "YOUR LANGUAGE REFLECTS ",
  titlePart2: "YOUR CHANGEMAKING WORLDVIEW",
  titlePart3: "LEARN HOW",
};

export function Hero() {
  return (
    <section className="pb-14 pt-14 sm:pb-16 sm:pt-20">
      <p className="font-mono text-xs uppercase tracking-widest text-muted animate-slide-up">
        {STRINGS.eyebrow}
      </p>
      <h1 className="mt-5 max-w-4xl font-display text-3xl font-normal leading-[1.15] text-ink sm:text-4xl lg:text-5xl uppercase tracking-tight animate-slide-up animation-delay-100">
        {STRINGS.titlePart1}
        <span className="font-light italic text-accent block mt-1">
          {STRINGS.titlePart2}
        </span>
        <span className="block font-mono text-xs sm:text-sm uppercase tracking-widest text-accent-cta mt-5">
          {STRINGS.titlePart3}
        </span>
      </h1>
      <div className="mt-8 max-w-[58ch] space-y-5 animate-slide-up animation-delay-200">
        <p className="font-sans text-base leading-[1.75] text-ink">
          Ashoka has spent the last 45 years learning from leading social entrepreneurs.
        </p>
        <p className="font-sans text-base leading-[1.75] text-ink">
          A commonality among them is that they describe the world through possibility, they value everyone&apos;s contribution, and they act accordingly.
        </p>
        <p className="font-sans text-base leading-[1.75] text-muted">
          We translated the patterns we learnt from them in a tool that everyone can use to understand their changemaker discursive enactment.
        </p>
      </div>
    </section>
  );
}
