"use client";

import { useState } from "react";
import { DIMENSIONS } from "@/lib/paradigm";
import type { ChangeSummary, DimensionMovement } from "@/lib/changeNarrative";

type Status = "idle" | "loading" | "done" | "error";

const MOVEMENT_LABELS: Record<DimensionMovement, string> = {
  improved: "Improved",
  regressed: "Regressed",
  stable: "Stable",
};

function groupByMovement(dimensionMovement: ChangeSummary["dimensionMovement"]): Record<DimensionMovement, string[]> {
  const groups: Record<DimensionMovement, string[]> = { improved: [], regressed: [], stable: [] };
  for (const d of DIMENSIONS) {
    groups[dimensionMovement[d.key]].push(d.key);
  }
  return groups;
}

/**
 * Feedback Card "Part D — Change over time". On-demand (idle by default,
 * same UX pattern as FeedbackCard) rather than auto-fetched on page load —
 * generating a narrative costs a real Claude call every time.
 *
 * All deltas/movement shown here come verbatim from the API response, which
 * computes them via the same lib/compare.ts functions the rest of the
 * compare view uses on this exact t1/t2 pair — so these numbers are
 * guaranteed to match what's displayed above, by construction.
 */
export function ChangeNarrativeCard({ entryId1, entryId2 }: { entryId1: string; entryId2: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [summary, setSummary] = useState<ChangeSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function requestNarrative() {
    setStatus("loading");
    setErrorMsg(null);
    setSummary(null);

    try {
      const res = await fetch("/api/compare/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId1, entryId2 }),
      });
      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "An unexpected error occurred while generating the change narrative.";
        setErrorMsg(msg);
        setStatus("error");
        return;
      }

      setSummary(data as ChangeSummary);
      setStatus("done");
    } catch {
      setErrorMsg("Could not connect to the narrative service.");
      setStatus("error");
    }
  }

  // --- IDLE ---
  if (status === "idle") {
    return (
      <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Part D — Change Over Time</p>
        <h2 className="mt-3 font-display text-xl font-normal leading-snug text-ink sm:text-2xl">
          Read the <span className="font-light italic text-accent">shift</span> between these two entries
        </h2>
        <p className="mt-2 max-w-[55ch] font-sans text-sm leading-relaxed text-muted">
          A grounded paragraph explaining the pattern above — which dimensions moved, and a plausible
          reading of why, drawn from both entries&apos; material.
        </p>
        <button
          type="button"
          onClick={requestNarrative}
          className="mt-6 rounded-md bg-accent-cta px-6 py-2.5 font-mono text-sm uppercase tracking-widest text-white transition-all hover:bg-accent hover:shadow-md"
        >
          Generate Change Narrative
        </button>
      </div>
    );
  }

  // --- LOADING ---
  if (status === "loading") {
    return (
      <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Part D — Change Over Time</p>
        <div className="mt-6 flex items-start gap-4">
          <div
            className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-border"
            style={{ borderTopColor: "#E87722" }}
          />
          <div>
            <p className="font-sans text-sm leading-relaxed text-ink" aria-live="polite">
              Reading the shift between these two entries…
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
              This usually takes 5–15 seconds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- ERROR ---
  if (status === "error") {
    return (
      <div
        className="border border-border bg-surface p-5 sm:p-6 lg:p-8"
        style={{ borderLeftWidth: 3, borderLeftColor: "#E87722" }}
        role="alert"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Part D — Change Over Time</p>
        <p className="mt-2 font-sans text-sm leading-relaxed text-ink">
          {errorMsg ?? "Something went wrong. Please try again."}
        </p>
        <button
          type="button"
          onClick={requestNarrative}
          className="mt-4 rounded-md border border-border px-5 py-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-ink hover:text-ink"
        >
          ↻ Retry
        </button>
      </div>
    );
  }

  // --- DONE ---
  if (!summary) return null;
  const movementGroups = groupByMovement(summary.dimensionMovement);

  return (
    <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Part D — Change Over Time</p>
      <h2 className="mt-2 font-display text-xl font-normal leading-snug text-ink sm:text-2xl">
        What changed between <span className="font-light italic text-accent">t1 and t2</span>
      </h2>

      <p className="mt-4 font-sans text-base leading-relaxed text-ink">{summary.narrative}</p>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4">
        {(["improved", "regressed", "stable"] as DimensionMovement[]).map((movement) =>
          movementGroups[movement].length > 0 ? (
            <p key={movement} className="font-mono text-xs uppercase tracking-widest text-muted">
              {MOVEMENT_LABELS[movement]}:{" "}
              <span className="text-ink">{movementGroups[movement].join(", ")}</span>
            </p>
          ) : null,
        )}
      </div>
    </div>
  );
}
