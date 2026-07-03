import { getSupabaseClient } from "./client";
import { Subject, SubjectInput, SubjectWithStats } from "./types";

export async function createSubject(input: SubjectInput): Promise<Subject> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("subjects")
    .insert({
      ashoka_internal_id: input.ashoka_internal_id ?? null,
      name: input.name,
      type: input.type,
      parent_org_id: input.parent_org_id ?? null,
      created_by: input.created_by ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Subject;
}

export async function getSubject(id: string): Promise<Subject | null> {
  const client = getSupabaseClient();
  const { data, error } = await client.from("subjects").select().eq("id", id).maybeSingle();

  if (error) throw error;
  return data as Subject | null;
}

export async function listSubjects(): Promise<Subject[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("subjects")
    .select()
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Subject[];
}

// Pilot-scale N+1 (one count + one last-date query per subject) rather than a
// DB view/RPC — fine at the small subject counts this tool expects.
export async function listSubjectsWithStats(): Promise<SubjectWithStats[]> {
  const subjects = await listSubjects();
  const client = getSupabaseClient();

  return Promise.all(
    subjects.map(async (subject): Promise<SubjectWithStats> => {
      const { count, error: countError } = await client
        .from("entries")
        .select("id", { count: "exact", head: true })
        .eq("subject_id", subject.id);
      if (countError) throw countError;

      const { data: lastEntry, error: lastEntryError } = await client
        .from("entries")
        .select("entry_date")
        .eq("subject_id", subject.id)
        .order("entry_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lastEntryError) throw lastEntryError;

      return {
        ...subject,
        entryCount: count ?? 0,
        lastEntryDate: (lastEntry as { entry_date: string } | null)?.entry_date ?? null,
      };
    }),
  );
}
