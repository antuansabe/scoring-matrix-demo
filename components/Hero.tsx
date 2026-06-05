const STRINGS = {
  eyebrow: "An instrument from Ashoka · Framework Change",
  titlePart1: "YOUR LANGUAGE REFLECTS ",
  titlePart2: "YOUR CHANGEMAKING WORLDVIEW",
  titlePart3: "LEARN HOW",
};

export function Hero() {
  return (
    <section className="pb-10 pt-12 sm:pb-12 sm:pt-16">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        {STRINGS.eyebrow}
      </p>
      <h1 className="mt-4 max-w-4xl font-display text-3xl font-normal leading-[1.1] text-ink sm:text-4xl lg:text-5xl uppercase tracking-tight">
        {STRINGS.titlePart1}
        <span className="font-light italic text-accent block">
          {STRINGS.titlePart2}
        </span>
        <span className="block font-mono text-xs sm:text-sm uppercase tracking-widest text-accent mt-4">
          {STRINGS.titlePart3}
        </span>
      </h1>
      <div className="mt-6 max-w-[65ch] space-y-4">
        <p className="font-sans text-[1.0625rem] leading-[1.6] text-ink">
          Ashoka has spent the last 45 years learning from leading social entrepreneurs.
        </p>
        <p className="font-sans text-[1.0625rem] leading-[1.6] text-ink">
          A commonality among them is that they describe the world through possibility, they value everyone's contribution, and they act accordingly.
        </p>
        <p className="font-sans text-[1.0625rem] leading-[1.6] text-ink">
          We translated the patterns we learnt from them in a tool that everyone can use to understand their changemaker discursive enactment.
        </p>
      </div>
    </section>
  );
}
