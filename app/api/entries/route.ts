import { NextResponse } from "next/server";
import { createSubject, getSubject } from "@/lib/db/subjects";
import { createEntry } from "@/lib/db/entries";
import { saveAnalysis } from "@/lib/db/analyses";
import { MODEL_VERSION } from "@/lib/modelVersion";
import { GENRE_WEIGHTS } from "@/lib/paradigm";
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

function validate(body: unknown): { ok: true; payload: EntryPayload } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const b = body as Record<string, unknown>;

  const hasSubjectId = typeof b.subjectId === "string" && b.subjectId.length > 0;
  const newSubject = b.newSubject as NewSubjectPayload | undefined;
  const hasNewSubject = typeof newSubject === "object" && newSubject !== null;

  if (hasSubjectId === hasNewSubject) {
    return { ok: false, error: "Provide exactly one of `subjectId` or `newSubject`." };
  }

  if (hasNewSubject) {
    if (typeof newSubject.name !== "string" || newSubject.name.trim().length === 0) {
      return { ok: false, error: "`newSubject.name` is required." };
    }
    if (!VALID_SUBJECT_TYPES.includes(newSubject.type)) {
      return { ok: false, error: "`newSubject.type` must be 'jj_partner' or 'ngl'." };
    }
    if (newSubject.type === "ngl" && !newSubject.parentOrgId) {
      return { ok: false, error: "An NGL subject requires a parent JJ Partner (`newSubject.parentOrgId`)." };
    }
  }

  if (typeof b.entryDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(b.entryDate)) {
    return { ok: false, error: "`entryDate` must be a YYYY-MM-DD string." };
  }
  if (!VALID_MATERIAL_GENRES.includes(b.materialGenre as MaterialGenre)) {
    return { ok: false, error: "`materialGenre` is not a recognized genre." };
  }
  if (typeof b.ashokanName !== "string" || b.ashokanName.trim().length === 0) {
    return { ok: false, error: "`ashokanName` is required." };
  }
  if (typeof b.materialText !== "string" || b.materialText.trim().length === 0) {
    return { ok: false, error: "`materialText` is required." };
  }
  if (typeof b.dimensions !== "object" || b.dimensions === null) {
    return { ok: false, error: "`dimensions` is required." };
  }
  const dims = b.dimensions as Record<string, unknown>;
  for (const key of DIMENSION_KEYS) {
    if (!isDimensionScore(dims[key])) {
      return { ok: false, error: `\`dimensions.${key}\` is missing or invalid.` };
    }
  }
  if (typeof b.enactmentScore !== "number" || b.enactmentScore < 0 || b.enactmentScore > 100) {
    return { ok: false, error: "`enactmentScore` must be a number in [0, 100]." };
  }
  if (typeof b.eachOrientation !== "string" || b.eachOrientation.trim().length === 0) {
    return { ok: false, error: "`eachOrientation` is required." };
  }
  if (typeof b.feedback !== "object" || b.feedback === null) {
    return { ok: false, error: "`feedback` is required — save an entry only after the Deeper Reading feedback exists." };
  }
  if (b.effectiveGenreTag !== undefined && !VALID_GENRE_TAGS.includes(b.effectiveGenreTag as GenreTag)) {
    return { ok: false, error: "`effectiveGenreTag` is not a recognized genre tag." };
  }
  if (b.genreOverridden !== undefined && typeof b.genreOverridden !== "boolean") {
    return { ok: false, error: "`genreOverridden` must be a boolean." };
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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body is not valid JSON." }, { status: 400 });
  }

  const validated = validate(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
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
        return NextResponse.json({ error: "Subject not found." }, { status: 404 });
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

    // --- persist the analysis, stamped with the model version ---
    const analysis = await saveAnalysis({
      entry_id: entry.id,
      enactment_score: Math.round(payload.enactmentScore),
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

    return NextResponse.json({ subject, entry, analysis }, { status: 201 });
  } catch (err: unknown) {
    const { message, code } = describeError(err);
    if (code === "23514") {
      // Postgres check_violation — most likely ngl_requires_parent.
      return NextResponse.json(
        { error: `The database rejected this record: ${message}` },
        { status: 400 },
      );
    }
    console.error("[api/entries] Failed to save entry:", err);
    return NextResponse.json({ error: "Could not save this entry. Please try again." }, { status: 500 });
  }
}
