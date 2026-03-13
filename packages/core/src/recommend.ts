import { searchableComponents } from "@repo/ai-metadata";
import { normalizeQuery, normalizeText } from "./normalize.js";
import { scoreComponent } from "./score.js";
import type { RecommendationResult } from "./types.js";

export function recommendComponents(pageType: string): RecommendationResult[] {
  const normalizedQuery = normalizeQuery(pageType);
  const queryTokens = normalizeText(pageType);

  return searchableComponents
    .map((component) =>
      scoreComponent(component, {
        mode: "recommend",
        queryTokens,
        normalizedQuery
      })
    )
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score);
}
