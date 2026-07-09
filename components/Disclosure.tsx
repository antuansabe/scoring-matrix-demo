"use client";

import { useState, type ReactNode } from "react";

/**
 * Progressive-disclosure block (Phase 9). The full detail is one clearly
 * labeled click away — novices lead with the story, experts lose nothing.
 * No animation, generous target, state announced to assistive tech.
 */
export function Disclosure({
  showLabel,
  hideLabel,
  children,
  defaultOpen = false,
}: {
  showLabel: string;
  hideLabel: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="min-h-11 w-full cursor-pointer border border-border bg-surface px-5 py-3 text-left font-mono text-sm uppercase tracking-widest text-ink hover:border-accent hover:text-accent"
      >
        {open ? `— ${hideLabel}` : `+ ${showLabel}`}
      </button>
      {open && <div className="mt-8 space-y-8">{children}</div>}
    </div>
  );
}
