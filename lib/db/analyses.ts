import { getSupabaseClient } from "./client";
import { Analysis, AnalysisInput, AnalysisWithEntry } from "./types";

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

// Joined with entries so a subject's analyses can be walked in chronological
// order without a second round-trip; entry_date lives on entries, not analyses.
export async function listAnalysesBySubject(subjectId: string): Promise<AnalysisWithEntry[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("analyses")
    .select(
      "id, entry_id, enactment_score, d1, d2, d3, d4, d5, each_orientation, lens_a_tag, lens_b_flag, feedback_card, model_version, created_at, entry:entries!inner(entry_date, genre, ashokan_name, contextual_notes)"
    )
    .eq("entry.subject_id", subjectId)
    .order("entry_date", { foreignTable: "entry" });

  if (error) throw error;
  return (data ?? []) as unknown as AnalysisWithEntry[];
}
