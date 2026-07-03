import { getSupabaseClient } from "./client";
import { Subject, SubjectInput } from "./types";

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
