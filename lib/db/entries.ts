import { getSupabaseClient } from "./client";
import { Entry, EntryInput } from "./types";

export async function createEntry(input: EntryInput): Promise<Entry> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("entries")
    .insert({
      subject_id: input.subject_id,
      entry_date: input.entry_date,
      material_text: input.material_text,
      material_source_url: input.material_source_url ?? null,
      genre: input.genre,
      ashokan_name: input.ashokan_name,
      contextual_notes: input.contextual_notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Entry;
}

export async function listEntriesBySubject(subjectId: string): Promise<Entry[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("entries")
    .select()
    .eq("subject_id", subjectId)
    .order("entry_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Entry[];
}
