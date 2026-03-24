import { searchableComponents } from "@repo/ai-metadata";
import { resolveRecommendationsWithAI } from "./ai-intent.js";
import { normalizeQuery, normalizeText } from "./normalize.js";
import { scoreComponent } from "./score.js";
import type {
  RecommendComponentsOptions,
  RecommendComponentsOutput,
  RecommendationResult
} from "./types.js";

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function rankRecommendations(
  normalizedQuery: string,
  queryTokens: string[],
  aiSelectedComponents: string[] = []
): RecommendationResult[] {
  const aiPreferred = new Set(aiSelectedComponents);
  const isPageQuery = queryTokens.some((token) =>
    ["page", "screen", "layout"].includes(token)
  );
  const isSectionQuery = queryTokens.some((token) =>
    ["section", "card", "block"].includes(token)
  );
  const isAuthLikeQuery = queryTokens.some((token) =>
    ["login", "auth", "password", "signin", "signup"].includes(token)
  );
  const isEditLikeQuery = queryTokens.some((token) =>
    ["edit", "profile", "update", "account"].includes(token)
  );
  const isSearchLikeQuery = queryTokens.some((token) =>
    ["search", "find", "filter"].includes(token)
  );

  return searchableComponents
    .map((component) =>
      scoreComponent(component, {
        mode: "recommend",
        queryTokens,
        normalizedQuery
      })
    )
    .map((result) => {
      let score = result.score;
      const reasons = [...result.reasons];

      if (!aiPreferred.has(result.component.name)) {
        if (isPageQuery && result.component.name === "Layout") {
          score += 18;
          reasons.push("page-level query favors layout shell");
        }

        if (isSectionQuery && result.component.name === "Card") {
          score += 16;
          reasons.push("section-level query favors grouped card surface");
        }

        if (isAuthLikeQuery && ["Form", "Input", "Button"].includes(result.component.name)) {
          score += 12;
          reasons.push("auth-like query favors input flow composition");
        }

        if (
          isEditLikeQuery &&
          ["Layout", "Card", "Form", "Input", "Button"].includes(result.component.name)
        ) {
          score += 10;
          reasons.push("edit-like query favors structured form editing flow");
        }

        if (isSearchLikeQuery && result.component.name === "Icon") {
          score -= 4;
          reasons.push("icon is optional for search-style interaction");
        }

        if (result.component.category === "icon") {
          score -= 6;
          reasons.push("supporting component penalty");
        }

        return {
          ...result,
          score,
          reasons: unique(reasons)
        };
      }

      return {
        ...result,
        score: score + 40,
        reasons: unique([...reasons, "selected by AI intent"])
      };
    })
    .sort((left, right) => right.score - left.score);
}

export function recommendComponents(query: string): RecommendationResult[] {
  const normalizedQuery = normalizeQuery(query);
  const queryTokens = normalizeText(query);
  return rankRecommendations(normalizedQuery, queryTokens);
}

export async function recommendComponentsWithMode(
  query: string,
  options: RecommendComponentsOptions = {}
): Promise<RecommendComponentsOutput> {
  const provider = options.provider ?? "gemini";
  const model =
    options.model ?? (provider === "gemini" ? "gemini-2.0-flash" : "gpt-5-mini");
  const normalizedQuery = normalizeQuery(query);
  const queryTokens = normalizeText(query);

  const aiIntent = await resolveRecommendationsWithAI(query, { model, provider });

  if (aiIntent.recommendedComponents.length > 0) {
    return {
      results: rankRecommendations(
        normalizedQuery,
        queryTokens,
        aiIntent.recommendedComponents
      ),
      intentSource: "ai",
      provider,
      model,
      queryType: aiIntent.queryType,
      rationale: aiIntent.rationale
    };
  }

  return {
    results: rankRecommendations(normalizedQuery, queryTokens),
    intentSource: "fallback",
    provider,
    model,
    note: aiIntent.reason
  };
}
