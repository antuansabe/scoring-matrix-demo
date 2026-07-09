"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DIMENSIONS } from "@/lib/paradigm";
import type { ChangeSummary, DimensionMovement } from "@/lib/changeNarrative";

type Status = "idle" | "loading" | "done" | "error";

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
  const t = useTranslations("partD");
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
            : t("errorUnexpected");
        setErrorMsg(msg);
        setStatus("error");
        return;
      }

      setSummary(data as ChangeSummary);
      setStatus("done");
    } catch {
      setErrorMsg(t("errorConnect"));
      setStatus("error");
    }
  }

  // --- IDLE ---
  if (status === "idle") {
    return (
      <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("eyebrow")}</p>
        <h2 className="mt-3 font-display text-xl font-normal leading-snug text-ink sm:text-2xl">
          {t("idleTitlePart1")}
          <span className="font-light italic text-accent">{t("idleTitlePart2")}</span>
          {t("idleTitlePart3")}
        </h2>
        <p className="mt-2 max-w-[55ch] font-sans text-base leading-relaxed text-muted">
          {t("idleBody")}
        </p>
        <button
          type="button"
          onClick={requestNarrative}
          className="mt-6 rounded-md bg-accent-cta px-6 py-2.5 font-mono text-sm uppercase tracking-widest text-white transition-all hover:bg-accent hover:shadow-md"
        >
          {t("generate")}
        </button>
      </div>
    );
  }

  // --- LOADING ---
  if (status === "loading") {
    return (
      <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("eyebrow")}</p>
        <div className="mt-6 flex items-start gap-4">
          <div
            className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-border"
            style={{ borderTopColor: "#E87722" }}
          />
          <div>
            <p className="font-sans text-sm leading-relaxed text-ink" aria-live="polite">
              {t("loading")}
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
              {t("loadingTime")}
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
        <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("eyebrow")}</p>
        <p className="mt-2 font-sans text-sm leading-relaxed text-ink">
          {errorMsg ?? t("errorFallback")}
        </p>
        <button
          type="button"
          onClick={requestNarrative}
          className="mt-4 rounded-md border border-border px-5 py-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-ink hover:text-ink"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  // --- DONE ---
  if (!summary) return null;
  const movementGroups = groupByMovement(summary.dimensionMovement);

  return (
    <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{t("eyebrow")}</p>
      <h2 className="mt-2 font-display text-xl font-normal leading-snug text-ink sm:text-2xl">
        {t("doneTitlePart1")}
        <span className="font-light italic text-accent">{t("doneTitlePart2")}</span>
      </h2>

      <p className="mt-4 font-sans text-base leading-relaxed text-ink">{summary.narrative}</p>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4">
        {(["improved", "regressed", "stable"] as DimensionMovement[]).map((movement) =>
          movementGroups[movement].length > 0 ? (
            <p key={movement} className="font-mono text-xs uppercase tracking-widest text-muted">
              {t(`movement_${movement}`)}:{" "}
              <span className="text-ink">{movementGroups[movement].join(", ")}</span>
            </p>
          ) : null,
        )}
      </div>
    </div>
  );
}
