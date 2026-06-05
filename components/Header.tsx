import { NavLinks } from "./NavLinks";

/** Top bar: model name, version, and the Ashoka context line. */
export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-bg/85 border-b border-border/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 py-2.5">
        <p className="font-mono text-[0.68rem] uppercase tracking-widest text-ink sm:text-xs font-semibold">
          Changemaker Paradigm · Scoring Matrix
        </p>
        <p className="font-mono text-[0.68rem] uppercase tracking-widest text-muted sm:text-xs">
          Ashoka · Framework Change · v0.1
        </p>
      </div>
      <NavLinks />
    </header>
  );
}
