"use client";

import { useId, useState, type ReactNode } from "react";
import { GLOSSARY, type GlossaryKey } from "@/lib/copy/glossary";

/**
 * Plain-language affordance for a term of art (Phase 9). The term itself is
 * a button (dotted underline); one tap opens the plain explanation, with the
 * deeper grounding one more tap down. Click — not hover-only — so it works
 * for touch and for older readers; Escape or the close link dismisses it.
 */
export function Term({
  k,
  children,
  className = "",
}: {
  k: GlossaryKey;
  /** Visible text; defaults to the glossary label. */
  children?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [deeper, setDeeper] = useState(false);
  const panelId = useId();
  const entry = GLOSSARY[k];

  return (
    <span className={`relative inline-block ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen((v) => !v);
          setDeeper(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className="cursor-pointer border-b border-dotted border-muted text-inherit hover:border-accent hover:text-accent"
        title="What does this mean?"
      >
        {children ?? entry.label}
      </button>
      {open && (
        <span
          id={panelId}
          role="note"
          className="absolute left-0 top-full z-30 mt-2 block w-80 max-w-[82vw] border border-border bg-surface p-4 text-left normal-case tracking-normal"
        >
          <span className="block font-mono text-xs uppercase tracking-widest text-accent">
            {entry.label}
          </span>
          <span className="mt-2 block font-sans text-base leading-relaxed text-ink">
            {entry.plain}
          </span>
          {deeper ? (
            <span className="mt-3 block border-t border-border pt-3 font-sans text-base leading-relaxed text-muted">
              {entry.deeper}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setDeeper(true)}
              className="mt-3 block cursor-pointer font-mono text-xs uppercase tracking-widest text-muted hover:text-ink"
            >
              More detail →
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 block cursor-pointer font-mono text-xs uppercase tracking-widest text-muted hover:text-ink"
          >
            Close
          </button>
        </span>
      )}
    </span>
  );
}
