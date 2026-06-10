import fs from "node:fs";
import path from "node:path";
import { callClaudeWithCachedSystem } from "../lib/anthropic";
import { SCORER_SYSTEM_PROMPT } from "../lib/prompts/scorer";
import { validateAndComputeScore } from "../lib/scoring";
import { countWords } from "../lib/text";
import { SAMPLES } from "../lib/samples";
import type { DimensionKey } from "../lib/types";

// ---------------------------------------------------------------------------
// Environment Loader
// ---------------------------------------------------------------------------
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        const value = trimmed.substring(index + 1).trim();
        process.env[key] = value;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Cohen's Kappa Calculation
// ---------------------------------------------------------------------------
function calculateCohensKappa(humanScores: number[], modelScores: number[]): number {
  const n = humanScores.length;
  if (n === 0) return 0;
  
  // Calculate observed agreement
  let observedMatches = 0;
  for (let i = 0; i < n; i++) {
    if (humanScores[i] === modelScores[i]) {
      observedMatches++;
    }
  }
  const po = observedMatches / n;
  
  // Calculate marginal totals for each category (0..4)
  const humanCounts = new Array(5).fill(0);
  const modelCounts = new Array(5).fill(0);
  
  for (let i = 0; i < n; i++) {
    const hVal = Math.min(4, Math.max(0, Math.round(humanScores[i])));
    const mVal = Math.min(4, Math.max(0, Math.round(modelScores[i])));
    humanCounts[hVal]++;
    modelCounts[mVal]++;
  }
  
  let pe = 0;
  for (let k = 0; k < 5; k++) {
    pe += (humanCounts[k] / n) * (modelCounts[k] / n);
  }
  
  if (pe === 1) {
    return po === 1 ? 1.0 : 0.0;
  }
  
  return (po - pe) / (1.0 - pe);
}

// ---------------------------------------------------------------------------
// Main Evaluation Function
// ---------------------------------------------------------------------------
async function main() {
  loadEnv();

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY is not set in .env.local or process environment.");
    process.exit(1);
  }

  const inputDir = path.resolve(process.cwd(), "pipeline/input");
  const testSetFile = path.join(inputDir, "annotated-test-set.json");

  // Ensure pipeline/input directory exists
  if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir, { recursive: true });
  }

  // Pre-generate the annotated-test-set.json file if it does not exist
  if (!fs.existsSync(testSetFile)) {
    console.log(`Generating annotated test set from lib/samples.ts to ${testSetFile}...`);
    const testSetData = SAMPLES.map(sample => {
      const humanScores: Record<string, number> = {};
      for (const [dim, val] of Object.entries(sample.expertScores)) {
        humanScores[dim] = (val as any).score;
      }
      return {
        slug: sample.id,
        text: sample.excerpt,
        humanScores
      };
    });
    fs.writeFileSync(testSetFile, JSON.stringify(testSetData, null, 2), "utf8");
  }

  // Read the test set
  console.log(`Reading annotated test set from ${testSetFile}...`);
  const rawData = fs.readFileSync(testSetFile, "utf8");
  const testSet: Array<{
    slug: string;
    text: string;
    humanScores: Record<string, number>;
  }> = JSON.parse(rawData);

  console.log(`Starting evaluation on ${testSet.length} samples using Sonnet...`);
  console.log("--------------------------------------------------");

  const results: Array<{
    slug: string;
    humanD1: number;
    modelD1: number;
    deltaD1: number;
    humanD4: number;
    modelD4: number;
    deltaD4: number;
  }> = [];

  const allHumanD1: number[] = [];
  const allModelD1: number[] = [];
  const allHumanD4: number[] = [];
  const allModelD4: number[] = [];

  for (const item of testSet) {
    console.log(`Scoring sample "${item.slug}"...`);
    const words = countWords(item.text);

    try {
      const response = await callClaudeWithCachedSystem({
        model: "claude-sonnet-4-6",
        systemPrompt: SCORER_SYSTEM_PROMPT,
        userMessage: item.text,
        maxTokens: 5000,
        temperature: 0,
      });

      const parsed = validateAndComputeScore(response.text, words);

      if (!parsed.ok) {
        const errMsg = (parsed as any).error || "Unknown error";
        console.error(`  Error: Validation failed for "${item.slug}": ${errMsg}`);
        continue;
      }

      const modelD1 = parsed.result.dimensions.D1.score;
      const modelD4 = parsed.result.dimensions.D4.score;

      const humanD1 = item.humanScores.D1 ?? 0;
      const humanD4 = item.humanScores.D4 ?? 0;

      const deltaD1 = modelD1 - humanD1;
      const deltaD4 = modelD4 - humanD4;

      results.push({
        slug: item.slug,
        humanD1,
        modelD1,
        deltaD1,
        humanD4,
        modelD4,
        deltaD4,
      });

      allHumanD1.push(humanD1);
      allModelD1.push(modelD1);
      allHumanD4.push(humanD4);
      allModelD4.push(modelD4);

      console.log(`  Done. D1: Human ${humanD1} vs Model ${modelD1} (Delta: ${deltaD1 >= 0 ? "+" : ""}${deltaD1})`);
      console.log(`        D4: Human ${humanD4} vs Model ${modelD4} (Delta: ${deltaD4 >= 0 ? "+" : ""}${deltaD4})`);
    } catch (err) {
      console.error(`  Error: Call failed for "${item.slug}":`, err);
    }
  }

  console.log("\n==========================================================================================");
  console.log("                                  EVALUATION RESULTS TABLE                                ");
  console.log("==========================================================================================");
  console.log(
    "| " +
    "Slug".padEnd(20) +
    " | " +
    "Human D1" +
    " | " +
    "Model D1" +
    " | " +
    "Delta D1" +
    " | " +
    "Human D4" +
    " | " +
    "Model D4" +
    " | " +
    "Delta D4" +
    " |"
  );
  console.log("|----------------------|----------|----------|----------|----------|----------|----------|");

  for (const r of results) {
    const d1Sign = r.deltaD1 >= 0 ? "+" : "";
    const d4Sign = r.deltaD4 >= 0 ? "+" : "";
    console.log(
      "| " +
      r.slug.padEnd(20) +
      " | " +
      String(r.humanD1).padStart(8) +
      " | " +
      String(r.modelD1).padStart(8) +
      " | " +
      `${d1Sign}${r.deltaD1}`.padStart(8) +
      " | " +
      String(r.humanD4).padStart(8) +
      " | " +
      String(r.modelD4).padStart(8) +
      " | " +
      `${d4Sign}${r.deltaD4}`.padStart(8) +
      " |"
    );
  }
  console.log("==========================================================================================\n");

  // Agreement metrics
  const agreementMetrics = (humans: number[], models: number[]) => {
    const n = humans.length;
    if (n === 0) return { exact: 0, within1: 0, kappa: 0 };
    
    let exactMatches = 0;
    let within1Matches = 0;
    for (let i = 0; i < n; i++) {
      const diff = Math.abs(humans[i] - models[i]);
      if (diff === 0) exactMatches++;
      if (diff <= 1) within1Matches++;
    }

    const exactRate = exactMatches / n;
    const within1Rate = within1Matches / n;
    const kappa = calculateCohensKappa(humans, models);

    return { exact: exactRate, within1: within1Rate, kappa };
  };

  const d1Metrics = agreementMetrics(allHumanD1, allModelD1);
  const d4Metrics = agreementMetrics(allHumanD4, allModelD4);

  console.log("==========================================================================================");
  console.log("                                AGREEMENT METRICS SUMMARY                                 ");
  console.log("==========================================================================================");
  console.log(`D1 (Agency & Contribution):`);
  console.log(`  Exact Match Rate:    ${(d1Metrics.exact * 100).toFixed(1)}% (${allHumanD1.filter((h, i) => h === allModelD1[i]).length}/${allHumanD1.length})`);
  console.log(`  Within-1 Match Rate: ${(d1Metrics.within1 * 100).toFixed(1)}% (${allHumanD1.filter((h, i) => Math.abs(h - allModelD1[i]) <= 1).length}/${allHumanD1.length})`);
  console.log(`  Cohen's Kappa:       ${d1Metrics.kappa.toFixed(3)} (small sample size warning)`);
  console.log();
  console.log(`D4 (Collaboration & Leadership):`);
  console.log(`  Exact Match Rate:    ${(d4Metrics.exact * 100).toFixed(1)}% (${allHumanD4.filter((h, i) => h === allModelD4[i]).length}/${allHumanD4.length})`);
  console.log(`  Within-1 Match Rate: ${(d4Metrics.within1 * 100).toFixed(1)}% (${allHumanD4.filter((h, i) => Math.abs(h - allModelD4[i]) <= 1).length}/${allHumanD4.length})`);
  console.log(`  Cohen's Kappa:       ${d4Metrics.kappa.toFixed(3)} (small sample size warning)`);
  console.log("==========================================================================================\n");
}

main().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
});
