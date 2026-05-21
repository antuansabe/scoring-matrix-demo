import fs from "node:fs/promises";
import path from "node:path";

export interface TextFile {
  filename: string;
  content: string;
}

export async function readTextFiles(dir: string): Promise<TextFile[]> {
  const entries = await fs.readdir(dir);
  const txtEntries = entries.filter((e) => e.endsWith(".txt"));
  const results = await Promise.all(
    txtEntries.map(async (entry) => {
      const fullPath = path.join(dir, entry);
      const stat = await fs.stat(fullPath);
      if (!stat.isFile()) return null;
      const content = await fs.readFile(fullPath, "utf8");
      return { filename: entry, content };
    }),
  );
  return results.filter((r): r is TextFile => r !== null);
}

export async function writeJson(
  filePath: string,
  data: unknown,
): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
