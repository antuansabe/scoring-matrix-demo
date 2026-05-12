/** Top bar: model name, version, and the Ashoka context line. */
export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 py-3">
        <p className="font-mono text-[0.7rem] uppercase tracking-widest text-ink sm:text-xs">
          Changemaker Paradigm · Scoring Matrix
        </p>
        <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted sm:text-xs">
          Ashoka · Framework Change · v0.1
        </p>
      </div>
    </header>
  );
}
