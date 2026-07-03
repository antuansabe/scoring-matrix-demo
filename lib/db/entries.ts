import { Entry, EntryInput } from "./types";

export async function createEntry(input: EntryInput): Promise<Entry> {
  throw new Error("Not implemented");
}

export async function listEntriesBySubject(subjectId: string): Promise<Entry[]> {
  throw new Error("Not implemented");
}
