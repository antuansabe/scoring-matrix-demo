"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { DEMO_ORG_ID } from "@/lib/demo";

/**
 * First-run walkthrough (Phase 9). Opens once for a first-time visitor,
 * answers three questions in plain language, and offers the demo story.
 * Dismissible at every step; resumable (the step survives a reload); never
 * shown again after dismissal or completion unless re-invoked from the
 * header, which dispatches the OPEN_TOUR_EVENT. No animations.
 * Copy lives in the message catalogs (Phase 11a).
 */
export const OPEN_TOUR_EVENT = "cw-tour-open";
const STORAGE_KEY = "cw.tour.v1";
const TOTAL_STEPS = 3;

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
  const t = useTranslations("walkthrough");
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
      setStep(Number.isInteger(n) && n >= 0 && n < TOTAL_STEPS ? n : 0);
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

  const stepKey = `step${step + 1}` as "step1" | "step2" | "step3";
  const isLast = step === TOTAL_STEPS - 1;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("aria")}
      onKeyDown={(e) => {
        if (e.key === "Escape") dismiss();
      }}
    >
      <div
        ref={cardRef}
        tabIndex={-1}
        className="w-full max-w-lg border border-border bg-surface p-6 outline-none sm:p-8"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          {t("eyebrow", { step: step + 1, total: TOTAL_STEPS })}
        </p>
        <h2 className="mt-3 font-display text-2xl font-normal leading-tight text-ink">
          {t(`${stepKey}Title`)}
        </h2>
        <p className="mt-4 font-sans text-base leading-relaxed text-ink">{t(`${stepKey}Body`)}</p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <button
            type="button"
            onClick={dismiss}
            className="min-h-11 cursor-pointer px-2 font-mono text-sm uppercase tracking-widest text-muted hover:text-ink"
          >
            {t("skip")}
          </button>
          {isLast ? (
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={dismiss}
                className="min-h-11 cursor-pointer px-2 font-mono text-sm uppercase tracking-widest text-muted hover:text-ink"
              >
                {t("explore")}
              </button>
              <Link
                href={`/subjects/${DEMO_ORG_ID}`}
                onClick={dismiss}
                className="min-h-11 rounded-md bg-accent-cta px-6 py-3 font-mono text-sm uppercase tracking-widest text-white hover:bg-accent"
              >
                {t("seeDemo")}
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={next}
              className="min-h-11 cursor-pointer rounded-md bg-accent-cta px-6 py-3 font-mono text-sm uppercase tracking-widest text-white hover:bg-accent"
            >
              {t("next")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
