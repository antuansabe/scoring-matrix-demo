import { Subject, SubjectInput } from "./types";

export async function createSubject(input: SubjectInput): Promise<Subject> {
  throw new Error("Not implemented");
}

export async function getSubject(id: string): Promise<Subject | null> {
  throw new Error("Not implemented");
}

export async function listSubjects(): Promise<Subject[]> {
  throw new Error("Not implemented");
}
