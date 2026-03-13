import { searchableComponents } from "@repo/ai-metadata";
import { normalizeQuery, normalizeText } from "./normalize.js";
import { scoreComponent } from "./score.js";
import type { SearchResult } from "./types.js";

export function searchComponents(query: string): SearchResult[] {
  const normalizedQuery = normalizeQuery(query);
  const queryTokens = normalizeText(query);

  return searchableComponents
    .map((component) =>
      scoreComponent(component, {
        mode: "search",
        queryTokens,
        normalizedQuery
      })
    )
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score);
}
