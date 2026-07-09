import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { createSubject, getSubject } from "@/lib/db/subjects";
import { createEntry, countEntriesBySubject } from "@/lib/db/entries";
import { saveAnalysis } from "@/lib/db/analyses";
import { MODEL_VERSION } from "@/lib/modelVersion";
import { GENRE_WEIGHTS, calculateEnactmentScore } from "@/lib/paradigm";
import { getWeightVector } from "@/lib/scoring/weights";
import type { MaterialGenre, Subject, SubjectType } from "@/lib/db/types";
import type { DimensionKey, DimensionScore, FeedbackResult, GenreTag } from "@/lib/types";

export const runtime = "nodejs";

const DIMENSION_KEYS: DimensionKey[] = ["D1", "D2", "D3", "D4", "D5"];
const VALID_SUBJECT_TYPES: SubjectType[] = ["jj_partner", "ngl"];
const VALID_MATERIAL_GENRES: MaterialGenre[] = [
  "interview",
  "article",
  "website",
  "report",
  "social",
  "other",
];
// The scorer's own genre mechanism (drives weighting) — distinct from
// MaterialGenre (the intake classification). This is Lens A.
const VALID_GENRE_TAGS = Object.keys(GENRE_WEIGHTS) as GenreTag[];

type NewSubjectPayload = { name: string; type: SubjectType; parentOrgId?: string | null };

type EntryPayload = {
  subjectId?: string;
  newSubject?: NewSubjectPayload;
  entryDate: string;
  materialGenre: MaterialGenre;
  ashokanName: string;
  contextualNotes?: string;
  materialText: string;
  dimensions: Record<DimensionKey, DimensionScore>;
  enactmentScore: number;
  eachOrientation: string;
  /** Lens A (Genre & Mobility Tag) — the scorer's effective/detected genre tag. */
  effectiveGenreTag?: GenreTag;
  genreOverridden?: boolean;
  feedback: FeedbackResult;
};

function isDimensionScore(value: unknown): value is DimensionScore {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return typeof o.score === "number" && o.score >= 0 && o.score <= 4;
}

function describeError(err: unknown): { message: string; code?: string } {
  if (err && typeof err === "object") {
    const e = err as { message?: string; code?: string };
    return { message: e.message ?? String(err), code: e.code };
  }
  return { message: String(err) };
}

// Validation failures return an apiErrors.entries.* catalog key (+ optional
// params) — the POST handler localizes them. This keeps validate() pure.
type ValidationFailure = { ok: false; errorKey: string; params?: Record<string, string> };

function validate(body: unknown): { ok: true; payload: EntryPayload } | ValidationFailure {
  if (typeof body !== "object" || body === null) {
    return { ok: false, errorKey: "common.notObject" };
  }
  const b = body as Record<string, unknown>;

  const hasSubjectId = typeof b.subjectId === "string" && b.subjectId.length > 0;
  const newSubject = b.newSubject as NewSubjectPayload | undefined;
  const hasNewSubject = typeof newSubject === "object" && newSubject !== null;

  if (hasSubjectId === hasNewSubject) {
    return { ok: false, errorKey: "entries.subjectXor" };
  }

  if (hasNewSubject) {
    if (typeof newSubject.name !== "string" || newSubject.name.trim().length === 0) {
      return { ok: false, errorKey: "entries.newSubjectName" };
    }
    if (!VALID_SUBJECT_TYPES.includes(newSubject.type)) {
      return { ok: false, errorKey: "entries.newSubjectType" };
    }
    if (newSubject.type === "ngl" && !newSubject.parentOrgId) {
      return { ok: false, errorKey: "entries.nglNeedsParent" };
    }
  }

  if (typeof b.entryDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(b.entryDate)) {
    return { ok: false, errorKey: "entries.badEntryDate" };
  }
  if (!VALID_MATERIAL_GENRES.includes(b.materialGenre as MaterialGenre)) {
    return { ok: false, errorKey: "entries.badMaterialGenre" };
  }
  if (typeof b.ashokanName !== "string" || b.ashokanName.trim().length === 0) {
    return { ok: false, errorKey: "entries.ashokanRequired" };
  }
  if (typeof b.materialText !== "string" || b.materialText.trim().length === 0) {
    return { ok: false, errorKey: "entries.materialTextRequired" };
  }
  if (typeof b.dimensions !== "object" || b.dimensions === null) {
    return { ok: false, errorKey: "entries.dimensionsRequired" };
  }
  const dims = b.dimensions as Record<string, unknown>;
  for (const key of DIMENSION_KEYS) {
    if (!isDimensionScore(dims[key])) {
      return { ok: false, errorKey: "entries.dimensionInvalid", params: { key } };
    }
  }
  if (typeof b.enactmentScore !== "number" || b.enactmentScore < 0 || b.enactmentScore > 100) {
    return { ok: false, errorKey: "entries.badEnactment" };
  }
  if (typeof b.eachOrientation !== "string" || b.eachOrientation.trim().length === 0) {
    return { ok: false, errorKey: "entries.eachRequired" };
  }
  if (typeof b.feedback !== "object" || b.feedback === null) {
    return { ok: false, errorKey: "entries.feedbackRequired" };
  }
  if (b.effectiveGenreTag !== undefined && !VALID_GENRE_TAGS.includes(b.effectiveGenreTag as GenreTag)) {
    return { ok: false, errorKey: "entries.badGenreTag" };
  }
  if (b.genreOverridden !== undefined && typeof b.genreOverridden !== "boolean") {
    return { ok: false, errorKey: "entries.badOverridden" };
  }

  return {
    ok: true,
    payload: {
      subjectId: hasSubjectId ? (b.subjectId as string) : undefined,
      newSubject: hasNewSubject ? newSubject : undefined,
      entryDate: b.entryDate,
      materialGenre: b.materialGenre as MaterialGenre,
      ashokanName: (b.ashokanName as string).trim(),
      contextualNotes: typeof b.contextualNotes === "string" ? b.contextualNotes : undefined,
      materialText: b.materialText as string,
      dimensions: dims as Record<DimensionKey, DimensionScore>,
      enactmentScore: b.enactmentScore,
      eachOrientation: b.eachOrientation as string,
      effectiveGenreTag: b.effectiveGenreTag as GenreTag | undefined,
      genreOverridden: typeof b.genreOverridden === "boolean" ? b.genreOverridden : undefined,
      feedback: b.feedback as FeedbackResult,
    },
  };
}

export async function POST(request: Request): Promise<Response> {
  // Error messages follow the caller's locale (cw.locale cookie).
  const t = await getTranslations("apiErrors");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: t("common.badJson") }, { status: 400 });
  }

  const validated = validate(body);
  if (!validated.ok) {
    return NextResponse.json(
      { error: t(validated.errorKey, validated.params) },
      { status: 400 },
    );
  }
  const payload = validated.payload;

  try {
    // --- resolve the subject ---
    let subject: Subject;
    if (payload.newSubject) {
      subject = await createSubject({
        name: payload.newSubject.name.trim(),
        type: payload.newSubject.type,
        parent_org_id: payload.newSubject.parentOrgId ?? null,
      });
    } else {
      const existing = await getSubject(payload.subjectId as string);
      if (!existing) {
        return NextResponse.json({ error: t("entries.subjectNotFound") }, { status: 404 });
      }
      subject = existing;
    }

    // --- persist the entry ---
    const entry = await createEntry({
      subject_id: subject.id,
      entry_date: payload.entryDate,
      material_text: payload.materialText,
      genre: payload.materialGenre,
      ashokan_name: payload.ashokanName,
      contextual_notes: payload.contextualNotes ?? null,
    });

    // --- select the weight profile by subject type (Decision #5) ---
    // The subject's type is only known here, at save time — the ephemeral
    // analyzer scored with the default profile. Recompute with the type's
    // profile so org weights take effect at this seam once Giselle's values
    // land; today both profiles equal the default, so this is numerically
    // identical to the client's value.
    let enactmentScore = Math.round(payload.enactmentScore);
    if (payload.effectiveGenreTag) {
      const vector = getWeightVector(payload.effectiveGenreTag, subject.type);
      const recomputed = calculateEnactmentScore(
        payload.dimensions,
        payload.effectiveGenreTag,
        subject.type,
      );
      console.info(
        `[api/entries] weight profile "${subject.type}" · genre ${payload.effectiveGenreTag} · vector [${vector.join(", ")}] → enactment ${recomputed} (client sent ${enactmentScore})`,
      );
      if (recomputed !== enactmentScore) {
        console.warn(
          `[api/entries] client enactmentScore (${enactmentScore}) differs from the "${subject.type}" profile recompute (${recomputed}); storing the server value.`,
        );
      }
      enactmentScore = recomputed;
    }

    // --- persist the analysis, stamped with the model version ---
    const analysis = await saveAnalysis({
      entry_id: entry.id,
      enactment_score: enactmentScore,
      d1: payload.dimensions.D1.score,
      d2: payload.dimensions.D2.score,
      d3: payload.dimensions.D3.score,
      d4: payload.dimensions.D4.score,
      d5: payload.dimensions.D5.score,
      each_orientation: payload.eachOrientation,
      // Lens A (Genre & Mobility Tag) is the scorer's own genre mechanism —
      // not materialGenre, which is a separate intake classification.
      lens_a_tag: payload.effectiveGenreTag ?? null,
      feedback_card: payload.feedback,
      model_version: MODEL_VERSION,
    });

    // How many entries the subject now has — lets the save-confirmation
    // surface the compare CTA the moment the second entry lands (Phase 10).
    const subjectEntryCount = await countEntriesBySubject(subject.id);

    return NextResponse.json({ subject, entry, analysis, subjectEntryCount }, { status: 201 });
  } catch (err: unknown) {
    const { message, code } = describeError(err);
    if (code === "23514") {
      // Postgres check_violation — most likely ngl_requires_parent.
      return NextResponse.json(
        { error: t("entries.dbRejected", { message }) },
        { status: 400 },
      );
    }
    console.error("[api/entries] Failed to save entry:", err);
    return NextResponse.json({ error: t("entries.saveFailed") }, { status: 500 });
  }
}
