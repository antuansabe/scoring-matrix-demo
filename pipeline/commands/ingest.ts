import { Command } from "commander";
import path from "node:path";
import fs from "node:fs/promises";
import pLimit from "p-limit";
import { readTextFiles, writeJson, ensureDir, fileExists } from "../lib/io";
import { uniqueSlugify } from "../lib/slugify";
import { log } from "../lib/logger";
import { countWords } from "../../lib/text";

const MIN_WORDS = 50;
const MAX_WORDS = 7000;

interface SourceJson {
  schemaVersion: 1;
  slug: string;
  originalFilename: string;
  wordCount: number;
  text: string;
  ingestedAt: string;
}

interface IngestOptions {
  input: string;
  output: string;
  force: boolean;
}

export function registerIngest(program: Command): void {
  program
    .command("ingest")
    .description("Read .txt files from --input and write source.json to --output/{slug}/")
    .requiredOption("--input <dir>", "Directory containing .txt source files")
    .requiredOption("--output <dir>", "Root output directory")
    .option("--force", "Overwrite existing source.json files", false)
    .action(async (opts: IngestOptions) => {
      const inputDir = path.resolve(opts.input);
      const outputDir = path.resolve(opts.output);

      try {
        await fs.access(inputDir);
      } catch {
        log.error(`Input directory not found: ${opts.input}`);
        process.exit(1);
      }

      let files;
      try {
        files = await readTextFiles(inputDir);
      } catch (err) {
        log.error(`Failed to read input directory: ${String(err)}`);
        process.exit(1);
      }

      if (files.length === 0) {
        log.info("No .txt files found in input directory.");
        return;
      }

      // Assign all slugs upfront so collisions are resolved deterministically
      // before any async work begins.
      const seen = new Set<string>();
      const tasks = files.map(({ filename, content }) => ({
        filename,
        content,
        slug: uniqueSlugify(path.basename(filename, ".txt"), seen),
      }));

      const limit = pLimit(5);
      const ingested: string[] = [];
      const skipped: string[] = [];
      const outOfRange: string[] = [];

      await Promise.all(
        tasks.map(({ filename, content, slug }) =>
          limit(async () => {
            try {
              const wordCount = countWords(content);

              if (wordCount < MIN_WORDS || wordCount > MAX_WORDS) {
                log.warn(
                  `${filename}: ${wordCount} word${wordCount === 1 ? "" : "s"} — ` +
                    (wordCount < MIN_WORDS
                      ? `below minimum of ${MIN_WORDS}`
                      : `above maximum of ${MAX_WORDS}`) +
                    ", skipping",
                );
                outOfRange.push(slug);
                return;
              }

              const outFile = path.join(outputDir, slug, "source.json");

              if (!opts.force && (await fileExists(outFile))) {
                log.info(`${filename}: skipping (exists)`);
                skipped.push(slug);
                return;
              }

              await ensureDir(path.join(outputDir, slug));

              const record: SourceJson = {
                schemaVersion: 1,
                slug,
                originalFilename: filename,
                wordCount,
                text: content,
                ingestedAt: new Date().toISOString(),
              };

              await writeJson(outFile, record);
              log.success(slug);
              ingested.push(slug);
            } catch (err) {
              log.error(`${filename}: ${String(err)}`);
            }
          }),
        ),
      );

      const summary = [
        `Ingested ${ingested.length}`,
        `Skipped ${skipped.length}`,
        `Out-of-range ${outOfRange.length}`,
      ].join("  ·  ");

      console.log("\n" + "─".repeat(52));
      console.log(summary);
      if (ingested.length > 0) {
        for (const s of ingested) console.log(`  ${s}`);
      }
    });
}
