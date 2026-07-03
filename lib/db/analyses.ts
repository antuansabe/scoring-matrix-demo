import { Analysis, AnalysisInput, AnalysisWithEntry } from "./types";

export async function saveAnalysis(input: AnalysisInput): Promise<Analysis> {
  throw new Error("Not implemented");
}

export async function listAnalysesBySubject(subjectId: string): Promise<AnalysisWithEntry[]> {
  throw new Error("Not implemented");
}
