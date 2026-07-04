"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DEMO_ORG_ID } from "@/lib/demo";

/**
 * First-run walkthrough (Phase 9). Opens once for a first-time visitor,
 * answers three questions in plain language, and offers the demo story.
 * Dismissible at every step; resumable (the step survives a reload); never
 * shown again after dismissal or completion unless re-invoked from the
 * header, which dispatches the OPEN_TOUR_EVENT. No animations.
 */
export const OPEN_TOUR_EVENT = "cw-tour-open";
const STORAGE_KEY = "cw.tour.v1";

const STEPS = [
  {
    eyebrow: "First visit · Step 1 of 3",
    title: "What is this?",
    body: "Built by Ashoka to understand the stories behind its partnerships, this tool reads a piece of writing — an interview, a report, a post — and describes how it talks about change: who acts, who decides, who benefits. It doesn't grade people or organizations; it describes patterns in language, so we can watch how a narrative evolves over time.",
  },
  {
    eyebrow: "First visit · Step 2 of 3",
    title: "What do you need?",
    body: "One honest piece of text — something a person or an organization actually wrote or said, at least a paragraph or two. An interview transcript, a page from an annual report, a speech: anything where someone describes their work in their own words.",
  },
  {
    eyebrow: "First visit · Step 3 of 3",
    title: "Try it",
    body: "The fastest way to understand the tool is to see one story. We've prepared a fictional example — clearly marked DEMO — so you can explore a complete reading, and how it changed over five months, without setting anything up.",
  },
] as const;

function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage blocked — never auto-open, never crash
  }
}

function writeStored(value: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* storage blocked — the tour simply won't persist */
  }
}

export function Walkthrough() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // First visit: no stored value → open at step 0. A stored "step:N" means
  // the visitor left mid-tour → resume there. "done" → stay closed.
  useEffect(() => {
    const stored = readStored();
    if (stored === null) {
      setStep(0);
      setOpen(true);
    } else if (stored.startsWith("step:")) {
      const n = Number(stored.slice(5));
      setStep(Number.isInteger(n) && n >= 0 && n < STEPS.length ? n : 0);
      setOpen(true);
    }
  }, []);

  // Header re-invocation.
  useEffect(() => {
    function onOpen() {
      setStep(0);
      writeStored("step:0");
      setOpen(true);
    }
    window.addEventListener(OPEN_TOUR_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_TOUR_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (open) cardRef.current?.focus();
  }, [open, step]);

  if (!open) return null;

  function dismiss() {
    writeStored("done");
    setOpen(false);
  }

  function next() {
    const n = step + 1;
    setStep(n);
    writeStored(`step:${n}`);
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome tour"
      onKeyDown={(e) => {
        if (e.key === "Escape") dismiss();
      }}
    >
      <div
        ref={cardRef}
        tabIndex={-1}
        className="w-full max-w-lg border border-border bg-surface p-6 outline-none sm:p-8"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-accent">{current.eyebrow}</p>
        <h2 className="mt-3 font-display text-2xl font-normal leading-tight text-ink">
          {current.title}
        </h2>
        <p className="mt-4 font-sans text-base leading-relaxed text-ink">{current.body}</p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <button
            type="button"
            onClick={dismiss}
            className="min-h-11 cursor-pointer px-2 font-mono text-sm uppercase tracking-widest text-muted hover:text-ink"
          >
            Skip the tour
          </button>
          {isLast ? (
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={dismiss}
                className="min-h-11 cursor-pointer px-2 font-mono text-sm uppercase tracking-widest text-muted hover:text-ink"
              >
                I&apos;ll explore on my own
              </button>
              <Link
                href={`/subjects/${DEMO_ORG_ID}`}
                onClick={dismiss}
                className="min-h-11 rounded-md bg-accent-cta px-6 py-3 font-mono text-sm uppercase tracking-widest text-white hover:bg-accent"
              >
                See the demo story →
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={next}
              className="min-h-11 cursor-pointer rounded-md bg-accent-cta px-6 py-3 font-mono text-sm uppercase tracking-widest text-white hover:bg-accent"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
