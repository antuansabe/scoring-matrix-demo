import { NextResponse } from "next/server";
import { callClaudeWithCachedSystem, AnthropicConfigError } from "@/lib/anthropic";
import { SYNTHESIS_SYSTEM_PROMPT } from "@/lib/prompts/synthesis";
import { generateWordReport } from "@/lib/report-generator";
import type { AnalysisResult, SynthesisResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// Validates the parsed synthesis JSON matches the expected SynthesisResult structure.
function validateAndCleanSynthesis(parsed: any): SynthesisResult {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid synthesis format returned by LLM.");
  }

  const executiveSummary = typeof parsed.executiveSummary === "string" ? parsed.executiveSummary : "";
  
  const communityProfile = parsed.communityProfile || {};
  const cleanProfile = {
    narrativeSummary: typeof communityProfile.narrativeSummary === "string" ? communityProfile.narrativeSummary : "",
    dominantParadigm: typeof communityProfile.dominantParadigm === "string" ? communityProfile.dominantParadigm : "Emerging",
    averageScore: typeof communityProfile.averageScore === "number" ? communityProfile.averageScore : 0,
    keyStrengths: Array.isArray(communityProfile.keyStrengths) ? communityProfile.keyStrengths.map(String) : [],
    keyGaps: Array.isArray(communityProfile.keyGaps) ? communityProfile.keyGaps.map(String) : [],
  };

  const dimensionInsights = Array.isArray(parsed.dimensionInsights)
    ? parsed.dimensionInsights.map((d: any) => ({
        dimension: typeof d.dimension === "string" ? d.dimension : "D1",
        dimensionName: typeof d.dimensionName === "string" ? d.dimensionName : "",
        communityAverage: typeof d.communityAverage === "number" ? d.communityAverage : 0,
        insight: typeof d.insight === "string" ? d.insight : "",
        representativeQuote: typeof d.representativeQuote === "string" ? d.representativeQuote : "",
      }))
    : [];

  const helloWorldShifts = Array.isArray(parsed.helloWorldShifts)
    ? parsed.helloWorldShifts.map((s: any) => ({
        shiftId: typeof s.shiftId === "string" ? s.shiftId : "",
        shiftLabel: typeof s.shiftLabel === "string" ? s.shiftLabel : "",
        frequency: typeof s.frequency === "string" ? s.frequency : "Absent",
        insight: typeof s.insight === "string" ? s.insight : "",
        exampleQuote: typeof s.exampleQuote === "string" ? s.exampleQuote : null,
      }))
    : [];

  const narrativePatterns = Array.isArray(parsed.narrativePatterns)
    ? parsed.narrativePatterns.map((p: any) => ({
        pattern: typeof p.pattern === "string" ? p.pattern : "",
        description: typeof p.description === "string" ? p.description : "",
        frequency: typeof p.frequency === "string" ? p.frequency : "",
        exampleQuote: typeof p.exampleQuote === "string" ? p.exampleQuote : "",
      }))
    : [];

  const geographicCoverage = parsed.geographicCoverage || {};
  const cleanGeo = {
    summary: typeof geographicCoverage.summary === "string" ? geographicCoverage.summary : "",
    mainLocations: Array.isArray(geographicCoverage.mainLocations) ? geographicCoverage.mainLocations.map(String) : [],
    gaps: typeof geographicCoverage.gaps === "string" ? geographicCoverage.gaps : "",
  };

  const standoutVoices = Array.isArray(parsed.standoutVoices)
    ? parsed.standoutVoices.map((v: any) => ({
        articleName: typeof v.articleName === "string" ? v.articleName : "",
        score: typeof v.score === "number" ? v.score : 0,
        paradigm: typeof v.paradigm === "string" ? v.paradigm : "",
        whatMakesItDifferent: typeof v.whatMakesItDifferent === "string" ? v.whatMakesItDifferent : "",
      }))
    : [];

  const opportunities = Array.isArray(parsed.opportunities) ? parsed.opportunities.map(String) : [];

  return {
    executiveSummary,
    communityProfile: cleanProfile,
    dimensionInsights,
    helloWorldShifts,
    narrativePatterns,
    geographicCoverage: cleanGeo,
    standoutVoices,
    opportunities,
  };
}

export async function POST(request: Request): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body is not valid JSON." }, { status: 400 });
  }

  const { articles, batchName, exportedAt } = body;

  // 1. Validation
  if (!Array.isArray(articles) || articles.length === 0) {
    return NextResponse.json({ error: "Articles array is empty or missing." }, { status: 400 });
  }

  if (articles.length > 150) {
    return NextResponse.json({ error: "Cannot synthesize more than 150 articles at once." }, { status: 400 });
  }

  // 2. Filter done articles
  const doneArticles = articles.filter(
    (item: any) => item && item.score && item.score.enactmentScore !== undefined
  ) as AnalysisResult[];

  if (doneArticles.length === 0) {
    return NextResponse.json(
      { error: "No successfully analyzed articles are present in the batch." },
      { status: 400 }
    );
  }

  // 3. Prepare Prompt & Call Claude Sonnet
  let synthesisJSON: any;
  try {
    const userMessage = `You are analyzing a batch of narrative evaluation reports.
    
Metadata:
- Batch / Client Name: ${batchName || "N/A"}
- Export Date: ${new Date(exportedAt).toISOString()}
- Total Successful Articles: ${doneArticles.length}

Below is the complete JSON array of the analyzed articles including their Enactment Scores, Dimension Profiles, justifications, actor/geography extractions, and Hello World shifts:

${JSON.stringify(
  doneArticles.map((art) => ({
    name: (art as any).name || "Untitled",
    score: art.score,
    extraction: art.extraction,
  })),
  null,
  2
)}

CONSTRAINTS:
- Be highly rigorous, academic, and specific, but also concise and focused.
- To prevent JSON truncation and ensure the entire response fits safely within the 4000 token limit, write extremely crisp descriptions.
- Keep each paragraph (e.g. executiveSummary, narrativeSummary, geographicCoverage) dense but limited to 100-150 words.
- Keep each bullet point / list item / insight limited to 1-2 clear, high-impact sentences.

Perform your synthesis. Return ONLY the strict JSON object corresponding to the required schema, with no preamble, postamble, or code fences.`;

    const response = await callClaudeWithCachedSystem({
      model: "claude-sonnet-4-6",
      systemPrompt: SYNTHESIS_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 4000,
      temperature: 0,
    });

    try {
      synthesisJSON = JSON.parse(response.text.trim());
    } catch (parseErr: any) {
      console.error("[generate-report] Error parsing LLM response as JSON:", response.text);
      return NextResponse.json(
        { error: "Claude did not return a valid JSON structure. Please try again." },
        { status: 502 }
      );
    }
  } catch (err: any) {
    if (err instanceof AnthropicConfigError) {
      console.error("[generate-report] ANTHROPIC_API_KEY is not configured.");
      return NextResponse.json(
        { error: "The report synthesis service is not available right now (API Key not set)." },
        { status: 500 }
      );
    }
    console.error("[generate-report] LLM generation failed:", err);
    return NextResponse.json(
      { error: `Synthesis failed: ${err.message || "Unknown error occurred"}` },
      { status: 502 }
    );
  }

  // 4. Validate and Clean Synthesis Schema
  let synthesis: SynthesisResult;
  try {
    synthesis = validateAndCleanSynthesis(synthesisJSON);
  } catch (err: any) {
    console.error("[generate-report] Synthesis validation failed:", err);
    return NextResponse.json(
      { error: "Synthesis output was malformed. Please try again." },
      { status: 500 }
    );
  }

  // 5. Generate Word Document (.docx) buffer
  let fileBuffer: Buffer;
  try {
    fileBuffer = await generateWordReport(doneArticles, synthesis, {
      batchName,
      exportedAt,
      totalAnalyzed: doneArticles.length,
    });
  } catch (err: any) {
    console.error("[generate-report] Word document generation failed:", err);
    return NextResponse.json(
      { error: `Could not build Word document: ${err.message || "Unknown error"}` },
      { status: 500 }
    );
  }

  // 6. Return Word Binary
  const dateStr = new Date(exportedAt).toISOString().split("T")[0];
  const filename = `narrative-report-${dateStr}.docx`;

  return new Response(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(fileBuffer.length),
    },
  });
}
