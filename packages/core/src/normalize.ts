export function normalizeText(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}
