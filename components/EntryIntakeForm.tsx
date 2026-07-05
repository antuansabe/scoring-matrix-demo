"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Subject, SubjectType, MaterialGenre } from "@/lib/db/types";
import type { ScoreResult, FeedbackResult } from "@/lib/types";
import { detectMixedGenreHint } from "@/lib/text";
import { Term } from "@/components/Term";
import { useTranslations } from "next-intl";

const MATERIAL_GENRES: MaterialGenre[] = ["interview", "article", "website", "report", "social", "other"];
const SUBJECT_TYPE_VALUES: SubjectType[] = ["jj_partner", "ngl"];

function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const inputClass =
  "block w-full border border-border bg-surface px-3 py-2 font-sans text-sm text-ink placeholder:text-muted focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all rounded-md";
const labelClass = "font-mono text-xs uppercase tracking-widest text-muted";

type SaveStatus = "idle" | "saving" | "done" | "error";

/**
 * Turns a completed live analysis into a dated entry tied to a subject.
 * Requires the Deeper Reading feedback to already exist — `analyses.feedback_card`
 * is not-null in the schema, so there is nothing valid to persist without it.
 */
export function EntryIntakeForm({
  subjects,
  materialText,
  materialSourceUrl,
  score,
  feedback,
  onSaved,
  lockedSubject,
}: {
  subjects: Subject[];
  materialText: string;
  materialSourceUrl?: string;
  score: ScoreResult;
  feedback: FeedbackResult | null;
  onSaved?: (subject: Subject) => void;
  /** Subject-first flow (Phase 10): arrived via "Add entry" on a subject
      page — the subject is fixed, no pickers. */
  lockedSubject?: Subject;
}) {
  const t = useTranslations("intake");
  const tg = useTranslations("genres");
  const ts = useTranslations("subjectTypes");
  const jjPartners = useMemo(() => subjects.filter((s) => s.type === "jj_partner"), [subjects]);
  const mixedGenreHint = useMemo(() => detectMixedGenreHint(materialText), [materialText]);

  const [mode, setMode] = useState<"existing" | "new">(subjects.length > 0 ? "existing" : "new");
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id ?? "");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<SubjectType>("jj_partner");
  const [parentOrgId, setParentOrgId] = useState("");
  const [entryDate, setEntryDate] = useState(todayISO);
  const [materialGenre, setMaterialGenre] = useState<MaterialGenre | "">("");
  const [ashokanName, setAshokanName] = useState("");
  const [contextualNotes, setContextualNotes] = useState("");

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSubject, setSavedSubject] = useState<Subject | null>(null);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [savedEntryCount, setSavedEntryCount] = useState<number | null>(null);

  const subjectValid = lockedSubject
    ? true
    : mode === "existing"
      ? selectedSubjectId.length > 0
      : newName.trim().length > 0 && (newType !== "ngl" || parentOrgId.length > 0);

  const canSave =
    feedback !== null &&
    subjectValid &&
    entryDate.length > 0 &&
    materialGenre.length > 0 &&
    ashokanName.trim().length > 0 &&
    status !== "saving";

  async function handleSave() {
    if (!canSave || !feedback) return;
    setStatus("saving");
    setErrorMsg(null);

    // Lens A (Genre & Mobility Tag) is the model's own genre mechanism — the
    // same one that drove the scoring weights — not the intake's materialGenre.
    const effectiveGenreTag = score.effectiveGenreTag ?? score.detectedGenreTag ?? score.genreTag;

    const payload = {
      ...(lockedSubject
        ? { subjectId: lockedSubject.id }
        : mode === "existing"
          ? { subjectId: selectedSubjectId }
          : {
              newSubject: {
                name: newName.trim(),
                type: newType,
                parentOrgId: newType === "ngl" ? parentOrgId : null,
              },
            }),
      entryDate,
      materialGenre,
      ashokanName: ashokanName.trim(),
      contextualNotes: contextualNotes.trim() || undefined,
      materialText,
      materialSourceUrl,
      dimensions: score.dimensions,
      enactmentScore: score.enactmentScore,
      eachOrientation: score.eachOrientation,
      effectiveGenreTag,
      genreOverridden: score.genreOverridden ?? false,
      feedback,
    };

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : t("errorFallback");
        setErrorMsg(msg);
        setStatus("error");
        return;
      }

      const result = data as { subject: Subject; entry: { id: string }; subjectEntryCount?: number };
      setSavedSubject(result.subject);
      setSavedEntryId(result.entry.id);
      setSavedEntryCount(typeof result.subjectEntryCount === "number" ? result.subjectEntryCount : null);
      setStatus("done");
      onSaved?.(result.subject);
    } catch {
      setErrorMsg(t("errorConnect"));
      setStatus("error");
    }
  }

  // --- DONE ---
  if (status === "done" && savedSubject) {
    const comparisonReady = (savedEntryCount ?? 0) >= 2;
    return (
      <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8" style={{ borderLeftWidth: 3, borderLeftColor: "var(--accent-2)" }}>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-2">{t("savedEyebrow")}</p>
        <h2 className="mt-3 font-display text-xl font-normal leading-snug text-ink sm:text-2xl">
          {t.rich("savedTitle", {
            date: entryDate,
            name: () => <span className="font-light italic text-accent">{savedSubject.name}</span>,
          })}
        </h2>
        {comparisonReady && (
          <p className="mt-3 max-w-[55ch] font-sans text-base leading-relaxed text-ink">
            {t("payoff", { name: savedSubject.name, count: savedEntryCount ?? 0 })}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-4">
          {comparisonReady && (
            <Link
              href={`/subjects/${savedSubject.id}/compare`}
              className="min-h-11 rounded-md bg-accent-cta px-6 py-3 font-mono text-sm uppercase tracking-widest text-white hover:bg-accent"
            >
              {t("compareCta")}
            </Link>
          )}
          <Link href={`/subjects/${savedSubject.id}`} className="font-mono text-xs uppercase tracking-widest text-accent hover:text-accent-cta transition-colors">
            {t("backTo", { name: savedSubject.name })}
          </Link>
          {savedEntryId && (
            <Link
              href={`/subjects/${savedSubject.id}/entries/${savedEntryId}`}
              className="font-mono text-xs uppercase tracking-widest text-muted hover:text-ink transition-colors"
            >
              {t("viewCard")}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">{t("eyebrow")}</p>
      <h2 className="mt-3 font-display text-xl font-normal leading-snug text-ink sm:text-2xl">
        {t("titlePart1")}
        <span className="font-light italic text-accent">{t("titlePart2")}</span>
      </h2>
      <p className="mt-2 max-w-[55ch] font-sans text-sm leading-relaxed text-muted">
        {t("body")}
      </p>

      {feedback === null && (
        <p className="mt-5 border-l-2 border-border pl-4 font-sans text-sm text-muted">
          {t("unlockHint")}
        </p>
      )}

      {mixedGenreHint && (
        <div
          className="mt-5 border px-4 py-3 font-sans text-sm leading-relaxed text-ink rounded-sm"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)", backgroundColor: "color-mix(in srgb, var(--accent) 6%, transparent)" }}
          role="alert"
        >
          {mixedGenreHint}
        </div>
      )}

      <fieldset disabled={feedback === null} className="mt-6 space-y-5 disabled:opacity-40">
        {/* Subject */}
        {lockedSubject ? (
          <div className="border-l-2 border-accent pl-4">
            <p className={labelClass}>{t("subject")}</p>
            <p className="mt-2 font-display text-lg text-ink">{lockedSubject.name}</p>
            <p className="mt-1 font-sans text-base leading-relaxed text-muted">
              {t("lockedNote")}{" "}
              <Link href="/subjects" className="text-accent hover:underline">
                {t("notThisSubject")}
              </Link>
            </p>
          </div>
        ) : (
        <div>
          <p className={labelClass}>{t("subject")}</p>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2 font-sans text-sm text-ink">
              <input
                type="radio"
                name="subject-mode"
                checked={mode === "existing"}
                onChange={() => setMode("existing")}
                disabled={subjects.length === 0}
              />
              {t("existing")}
            </label>
            <label className="flex items-center gap-2 font-sans text-sm text-ink">
              <input type="radio" name="subject-mode" checked={mode === "new"} onChange={() => setMode("new")} />
              {t("new")}
            </label>
          </div>

          {mode === "existing" ? (
            subjects.length > 0 ? (
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className={`${inputClass} mt-3`}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {ts(s.type)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-3 font-sans text-sm text-muted">{t("noSubjects")}</p>
            )
          ) : (
            <div className="mt-3 space-y-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("subjectNamePlaceholder")}
                className={inputClass}
              />
              <select value={newType} onChange={(e) => setNewType(e.target.value as SubjectType)} className={inputClass}>
                {SUBJECT_TYPE_VALUES.map((v) => (
                  <option key={v} value={v}>
                    {ts(v)}
                  </option>
                ))}
              </select>
              {newType === "ngl" && (
                jjPartners.length > 0 ? (
                  <select value={parentOrgId} onChange={(e) => setParentOrgId(e.target.value)} className={inputClass}>
                    <option value="">{t("selectParent")}</option>
                    {jjPartners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="font-sans text-sm text-muted">
                    {t("nglNeedsParent")}
                  </p>
                )
              )}
            </div>
          )}
        </div>
        )}

        {/* Material date + genre */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="entry-date">
              <Term k="materialDate">{t("materialDate")}</Term>
            </label>
            <input
              id="entry-date"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className={`${inputClass} mt-2`}
            />
            <p className="mt-1.5 font-sans text-sm leading-relaxed text-muted">
              {t("materialDateHelp")}
            </p>
          </div>
          <div>
            <label className={labelClass} htmlFor="material-genre">
              {t("genre")}
            </label>
            <select
              id="material-genre"
              value={materialGenre}
              onChange={(e) => setMaterialGenre(e.target.value as MaterialGenre)}
              className={`${inputClass} mt-2`}
            >
              <option value="">{t("selectGenre")}</option>
              {MATERIAL_GENRES.map((g) => (
                <option key={g} value={g}>
                  {tg(g)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ashokan name */}
        <div>
          <label className={labelClass} htmlFor="ashokan-name">
            {t("ashokanName")}
          </label>
          <input
            id="ashokan-name"
            type="text"
            value={ashokanName}
            onChange={(e) => setAshokanName(e.target.value)}
            placeholder={t("ashokanPlaceholder")}
            className={`${inputClass} mt-2`}
          />
        </div>

        {/* Contextual notes */}
        <div>
          <label className={labelClass} htmlFor="contextual-notes">
            {t("notes")} <span className="normal-case text-muted/70">{t("notesOptional")}</span>
          </label>
          <textarea
            id="contextual-notes"
            value={contextualNotes}
            onChange={(e) => setContextualNotes(e.target.value)}
            rows={2}
            className={`${inputClass} mt-2 resize-y`}
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="bg-accent-cta px-6 py-2.5 font-mono text-sm uppercase tracking-widest text-white rounded-md transition-all hover:bg-accent hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "saving" ? t("saving") : t("save")}
        </button>
      </fieldset>

      {status === "error" && errorMsg && (
        <div className="mt-4 border border-border bg-surface p-4" style={{ borderLeftWidth: 3, borderLeftColor: "#E87722" }} role="alert">
          <p className="font-sans text-sm text-ink">{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
