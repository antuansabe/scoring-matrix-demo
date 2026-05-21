export function slugify(input: string): string {
  const result = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return result.length > 0 ? result : "untitled";
}

export function uniqueSlugify(input: string, seen: Set<string>): string {
  const base = slugify(input);
  let candidate = base;
  let counter = 2;
  while (seen.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter++;
  }
  seen.add(candidate);
  return candidate;
}
