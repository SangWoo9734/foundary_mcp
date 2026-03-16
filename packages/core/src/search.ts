import { searchableComponents } from "@repo/ai-metadata";
import { normalizeQuery, normalizeText } from "./normalize.js";
import { scoreComponent } from "./score.js";
import type { SearchResult } from "./types.js";

export function searchComponents(query: string): SearchResult[] {
  const normalizedQuery = normalizeQuery(query);
  const queryTokens = normalizeText(query);

  if (queryTokens.length === 0) {
    return [];
  }

  return searchableComponents
    .map((component) =>
      scoreComponent(component, {
        mode: "search",
        queryTokens,
        normalizedQuery
      })
    )
    .filter((result) => result.score >= 12)
    .sort((left, right) => right.score - left.score);
}
