"use client";

import { useState } from "react";
import Link from "next/link";
import pLimit from "p-limit";
import type { Subject, MaterialGenre } from "@/lib/db/types";
import type { ScoreResult, FeedbackResult } from "@/lib/types";
import { countWords, detectMixedGenreHint } from "@/lib/text";
import { Term } from "@/components/Term";
import { useTranslations } from "next-intl";

const MIN_WORDS = 50;
const MAX_WORDS = 7000;

const MATERIAL_GENRES: MaterialGenre[] = ["interview", "article", "website", "report", "social", "other"];

function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const inputClass =
  "block w-full border border-border bg-surface px-3 py-2 font-sans text-base text-ink placeholder:text-muted focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all rounded-md";
const labelClass = "font-mono text-xs uppercase tracking-widest text-muted";

type ItemStatus = "pending" | "scoring" | "reading" | "saving" | "done" | "failed";

type BatchItem = {
  id: string;
  label: string;
  materialDate: string;
  genre: MaterialGenre;
  text: string;
  wordCount: number;
  status: ItemStatus;
  error?: string;
  savedScore?: number;
  savedParadigm?: string;
};

function itemName(item: BatchItem): string {
  return item.label || `${item.materialDate} · ${item.genre}`;
}

/**
 * Per-subject batch intake (Phase 10). Reuses the /batch machinery patterns —
 * pLimit(2) concurrency, per-item status, error isolation, per-item retry —
 * against the existing pipeline: /api/score → /api/feedback → /api/entries.
 * Each queued text becomes its own dated entry for THIS subject; one failure
 * never aborts the rest.
 */
export function SubjectBatchIntake({ subject }: { subject: Subject }) {
  const t = useTranslations("addBatch");
  const tg = useTranslations("genres");
  const [items, setItems] = useState<BatchItem[]>([]);
  const [phase, setPhase] = useState<"adding" | "processing" | "done">("adding");
  const [ashokanName, setAshokanName] = useState("");
  const [finalEntryCount, setFinalEntryCount] = useState<number | null>(null);

  // Draft item form
  const [label, setLabel] = useState("");
  const [materialDate, setMaterialDate] = useState(todayISO);
  const [genre, setGenre] = useState<MaterialGenre | "">("");
  const [text, setText] = useState("");
  const wordCount = countWords(text);
  const wordsOutOfRange = wordCount > 0 && (wordCount < MIN_WORDS || wordCount > MAX_WORDS);
  const mixedHint = detectMixedGenreHint(text);
  const canAdd =
    materialDate.length > 0 && genre !== "" && wordCount >= MIN_WORDS && wordCount <= MAX_WORDS;

  function addItem(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canAdd) return;
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: label.trim(),
        materialDate,
        genre: genre as MaterialGenre,
        text: text.trim(),
        wordCount,
        status: "pending",
      },
    ]);
    setLabel("");
    setGenre("");
    setText("");
    // materialDate deliberately kept — consecutive materials often share an era.
  }

  function updateItem(id: string, patch: Partial<BatchItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function retryItem(id: string) {
    updateItem(id, { status: "pending", error: undefined });
    setPhase("adding");
  }

  async function readJsonError(res: Response, fallback: string): Promise<string> {
    try {
      const j = await res.json();
      return typeof j?.error === "string" ? j.error : fallback;
    } catch {
      return fallback;
    }
  }

  async function processOne(item: BatchItem): Promise<number | null> {
    // 1 — score
    updateItem(item.id, { status: "scoring" });
    const scoreRes = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: item.text }),
    });
    if (!scoreRes.ok) throw new Error(await readJsonError(scoreRes, "Scoring failed."));
    const score = (await scoreRes.json()) as ScoreResult;

    // 2 — deeper reading (required: the saved record carries the card).
    // Voice follows the subject's type — an organization's texts are read
    // institutionally (Phase 6).
    updateItem(item.id, { status: "reading" });
    const feedbackRes = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: item.text,
        scores: score.dimensions,
        genre: score.genreTag,
        ...(subject.type === "jj_partner" ? { subjectVoice: "organization" } : {}),
      }),
    });
    if (!feedbackRes.ok) throw new Error(await readJsonError(feedbackRes, "Deeper reading failed."));
    const feedback = (await feedbackRes.json()) as FeedbackResult;

    // 3 — persist as a dated entry
    updateItem(item.id, { status: "saving" });
    const saveRes = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: subject.id,
        entryDate: item.materialDate,
        materialGenre: item.genre,
        ashokanName: ashokanName.trim(),
        contextualNotes: item.label || undefined,
        materialText: item.text,
        dimensions: score.dimensions,
        enactmentScore: score.enactmentScore,
        eachOrientation: score.eachOrientation,
        effectiveGenreTag: score.effectiveGenreTag ?? score.genreTag,
        genreOverridden: false,
        feedback,
      }),
    });
    if (!saveRes.ok) throw new Error(await readJsonError(saveRes, "Saving failed."));
    const saved = (await saveRes.json()) as {
      analysis: { enactment_score: number };
      subjectEntryCount?: number;
    };
    updateItem(item.id, {
      status: "done",
      savedScore: saved.analysis.enactment_score,
    });
    return typeof saved.subjectEntryCount === "number" ? saved.subjectEntryCount : null;
  }

  async function processAll() {
    const pending = items.filter((i) => i.status === "pending");
    if (pending.length === 0 || !ashokanName.trim()) return;
    setPhase("processing");

    const limit = pLimit(2);
    let latestCount: number | null = null;

    await Promise.all(
      pending.map((item) =>
        limit(async () => {
          try {
            const count = await processOne(item);
            if (count !== null) latestCount = Math.max(latestCount ?? 0, count);
          } catch (err: unknown) {
            updateItem(item.id, {
              status: "failed",
              error: err instanceof Error ? err.message : "Unknown error.",
            });
          }
        }),
      ),
    );

    setFinalEntryCount(latestCount);
    setPhase("done");
  }

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const doneCount = items.filter((i) => i.status === "done").length;
  const failedCount = items.filter((i) => i.status === "failed").length;
  const comparisonReady = (finalEntryCount ?? 0) >= 2;

  return (
    <div className="space-y-8">
      {/* Batch-level: who is logging */}
      <div className="border border-border bg-surface p-6 sm:p-8">
        <label className={labelClass} htmlFor="batch-ashokan">
          {t("yourName")}
        </label>
        <input
          id="batch-ashokan"
          type="text"
          value={ashokanName}
          onChange={(e) => setAshokanName(e.target.value)}
          placeholder={t("yourNamePlaceholder")}
          className={`${inputClass} mt-2 max-w-md`}
          disabled={phase === "processing"}
        />
      </div>

      {/* Add-to-queue form */}
      {phase !== "processing" && (
        <form onSubmit={addItem} className="border border-border bg-surface p-6 sm:p-8 space-y-5">
          <p className={labelClass}>{t("addMaterial")}</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="item-label">
                {t("label")} <span className="normal-case text-muted/70">{t("labelOptional")}</span>
              </label>
              <input
                id="item-label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t("labelPlaceholder")}
                className={`${inputClass} mt-2`}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="item-date">
                <Term k="materialDate">{t("materialDate")}</Term>
              </label>
              <input
                id="item-date"
                type="date"
                value={materialDate}
                onChange={(e) => setMaterialDate(e.target.value)}
                className={`${inputClass} mt-2`}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="item-genre">
                {t("genreLabel")}
              </label>
              <select
                id="item-genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value as MaterialGenre)}
                className={`${inputClass} mt-2`}
              >
                <option value="">{t("select")}</option>
                {MATERIAL_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {tg(g)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="font-sans text-sm leading-relaxed text-muted -mt-1">
            {t("dateNote")}
          </p>

          <div>
            <label className={labelClass} htmlFor="item-text">
              {t("text")}
            </label>
            <textarea
              id="item-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              spellCheck={false}
              placeholder={t("textPlaceholder", { min: MIN_WORDS, max: MAX_WORDS })}
              className={`${inputClass} mt-2 min-h-[10rem] resize-y`}
            />
            <p className={`mt-1.5 font-mono text-xs uppercase tracking-widest ${wordsOutOfRange ? "text-accent" : "text-muted"}`}>
              {wordsOutOfRange ? t("wordsNeeds", { count: wordCount, min: MIN_WORDS, max: MAX_WORDS }) : t("words", { count: wordCount })}
            </p>
            {mixedHint && (
              <p className="mt-2 border-l-2 border-accent pl-3 font-sans text-sm leading-relaxed text-ink">
                {mixedHint}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canAdd}
            className="min-h-11 rounded-md border border-accent px-6 py-2.5 font-mono text-sm uppercase tracking-widest text-accent transition-all hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("addToQueue")}
          </button>
        </form>
      )}

      {/* Queue */}
      {items.length > 0 && (
        <div className="border border-border bg-surface p-6 sm:p-8">
          <p className={labelClass}>{t("queue", { count: items.length })}</p>
          <ul className="mt-4 divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-display text-lg text-ink">{itemName(item)}</p>
                  <p className="mt-0.5 font-mono text-xs uppercase tracking-widest text-muted">
                    {item.materialDate} · {item.genre} · {item.wordCount} words ·{" "}
                    <span className={item.status === "failed" ? "text-accent" : ""}>
                      {t(`status_${item.status}`)}
                      {item.status === "done" && item.savedScore !== undefined
                        ? ` · ${item.savedScore}/100`
                        : ""}
                    </span>
                  </p>
                  {item.error && (
                    <p className="mt-1 font-sans text-sm leading-relaxed text-accent">{item.error}</p>
                  )}
                </div>
                {item.status === "pending" && phase !== "processing" && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="cursor-pointer px-2 font-mono text-lg text-muted hover:text-accent"
                    title={t("remove")}
                  >
                    ×
                  </button>
                )}
                {item.status === "failed" && phase !== "processing" && (
                  <button
                    type="button"
                    onClick={() => retryItem(item.id)}
                    className="min-h-11 cursor-pointer border border-accent px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-white"
                  >
                    {t("retry")}
                  </button>
                )}
              </li>
            ))}
          </ul>

          {phase === "processing" && (
            <p className="mt-4 font-sans text-base leading-relaxed text-muted" aria-live="polite">
              {t("processingNote")}
            </p>
          )}

          {phase !== "processing" && pendingCount > 0 && (
            <div className="mt-6">
              <button
                type="button"
                onClick={processAll}
                disabled={!ashokanName.trim()}
                className="min-h-11 w-full cursor-pointer rounded-md bg-accent-cta px-6 py-3.5 font-mono text-sm uppercase tracking-widest text-white transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("analyzeSave", { count: pendingCount })}
              </button>
              {!ashokanName.trim() && (
                <p className="mt-2 font-sans text-sm text-muted">
                  {t("nameFirst")}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Done summary */}
      {phase === "done" && (
        <div
          className="border border-border bg-surface p-6 sm:p-8"
          style={{ borderLeftWidth: 3, borderLeftColor: "var(--accent-2)" }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-accent-2">{t("completeEyebrow")}</p>
          <h2 className="mt-3 font-display text-xl font-normal leading-snug text-ink sm:text-2xl">
            {t.rich("savedTitle", {
              count: doneCount,
              name: () => <span className="font-light italic text-accent">{subject.name}</span>,
            })}
          </h2>
          {failedCount > 0 && (
            <p className="mt-2 font-sans text-base leading-relaxed text-muted">
              {t("failedNote", { count: failedCount })}
            </p>
          )}
          {comparisonReady && (
            <p className="mt-3 max-w-[55ch] font-sans text-base leading-relaxed text-ink">
              {t("payoff", { name: subject.name, count: finalEntryCount ?? 0 })}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-4">
            {comparisonReady && (
              <Link
                href={`/subjects/${subject.id}/compare`}
                className="min-h-11 rounded-md bg-accent-cta px-6 py-3 font-mono text-sm uppercase tracking-widest text-white hover:bg-accent"
              >
                {t("compareCta")}
              </Link>
            )}
            <Link
              href={`/subjects/${subject.id}`}
              className="font-mono text-xs uppercase tracking-widest text-accent hover:text-accent-cta"
            >
              {t("viewTimeline", { name: subject.name })}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
