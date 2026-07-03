import { getSupabaseClient } from "./client";
import { Analysis, AnalysisInput, AnalysisWithEntry, AnalysisWithMaterialText, MaterialGenre } from "./types";

export async function saveAnalysis(input: AnalysisInput): Promise<Analysis> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("analyses")
    .insert({
      entry_id: input.entry_id,
      enactment_score: input.enactment_score,
      d1: input.d1,
      d2: input.d2,
      d3: input.d3,
      d4: input.d4,
      d5: input.d5,
      each_orientation: input.each_orientation,
      lens_a_tag: input.lens_a_tag ?? null,
      lens_b_flag: input.lens_b_flag ?? null,
      feedback_card: input.feedback_card,
      model_version: input.model_version,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Analysis;
}

type EntryWithAnalysesRow = {
  subject_id: string;
  entry_date: string;
  genre: MaterialGenre;
  ashokan_name: string;
  contextual_notes: string | null;
  created_at: string;
  analyses: Analysis[];
};

// Queries FROM entries (not analyses) so entry_date is a plain, own-table
// order-by — ordering by a column on a joined/embedded resource via
// PostgREST's `foreignTable` option (the previous approach here) silently
// does not sort the result set in this Supabase project; it was only ever
// masked because earlier verification happened to use entries that were
// also created in chronological order. entries.created_at is a secondary
// tiebreak for same-date entries (Decision #6's same-day, different-genre
// case). Flattened back into AnalysisWithEntry[] so callers don't change.
export async function listAnalysesBySubject(subjectId: string): Promise<AnalysisWithEntry[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("entries")
    .select(
      "subject_id, entry_date, genre, ashokan_name, contextual_notes, created_at, analyses!inner(id, entry_id, enactment_score, d1, d2, d3, d4, d5, each_orientation, lens_a_tag, lens_b_flag, feedback_card, model_version, created_at)"
    )
    .eq("subject_id", subjectId)
    .order("entry_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as unknown as EntryWithAnalysesRow[];
  return rows.flatMap((row) => {
    const entry = {
      subject_id: row.subject_id,
      entry_date: row.entry_date,
      genre: row.genre,
      ashokan_name: row.ashokan_name,
      contextual_notes: row.contextual_notes,
    };
    return row.analyses.map((a) => ({ ...a, entry }));
  });
}

// Used by the entry detail page (Feedback Card link from the subject
// timeline) to fetch a single analysis by its entry, joined with the entry.
export async function getAnalysisByEntryId(entryId: string): Promise<AnalysisWithEntry | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("analyses")
    .select(
      "id, entry_id, enactment_score, d1, d2, d3, d4, d5, each_orientation, lens_a_tag, lens_b_flag, feedback_card, model_version, created_at, entry:entries!inner(subject_id, entry_date, genre, ashokan_name, contextual_notes)"
    )
    .eq("entry_id", entryId)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as AnalysisWithEntry) ?? null;
}

// Server-only: used by the Phase 5 change-narrative route to ground the
// generated paragraph in the actual source material. A single-row lookup by
// exact entry_id needs no ordering, so (unlike listAnalysesBySubject) the
// query-from-analyses shape here is fine.
export async function getAnalysisWithMaterialTextByEntryId(
  entryId: string,
): Promise<AnalysisWithMaterialText | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("analyses")
    .select(
      "id, entry_id, enactment_score, d1, d2, d3, d4, d5, each_orientation, lens_a_tag, lens_b_flag, feedback_card, model_version, created_at, entry:entries!inner(subject_id, entry_date, genre, ashokan_name, contextual_notes, material_text)"
    )
    .eq("entry_id", entryId)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as AnalysisWithMaterialText) ?? null;
}
