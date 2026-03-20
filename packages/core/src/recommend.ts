import { searchableComponents } from "@repo/ai-metadata";
import { normalizeQuery, normalizeText } from "./normalize.js";
import { scoreComponent } from "./score.js";
import {
  detectScenarios,
  ROLE_RULES,
  SCENARIO_RULES
} from "./scenarios.js";
import type { RecommendationResult } from "./types.js";

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function applyQueryShapeBias(
  queryTokens: string[],
  result: RecommendationResult
): RecommendationResult {
  let score = result.score;
  const reasons = [...result.reasons];

  const isPageQuery = queryTokens.some((token) =>
    ["page", "screen", "layout"].includes(token)
  );
  const isSectionQuery = queryTokens.some((token) =>
    ["section", "card", "panel"].includes(token)
  );

  if (isPageQuery) {
    if (result.component.name === "Layout") {
      score += 18;
      reasons.push("page-level query prefers explicit layout structure");
    }

    if (result.component.name === "Card") {
      score += 6;
      reasons.push("page-level query may group content with cards");
    }
  }

  if (isSectionQuery) {
    if (result.component.name === "Card") {
      score += 18;
      reasons.push("section-level query prefers grouped card content");
    }

    if (result.component.name === "Form" && queryTokens.includes("form")) {
      score += 10;
      reasons.push("section-level query may use a form block");
    }
  }

  return {
    ...result,
    score,
    reasons: unique(reasons)
  };
}

export function recommendComponents(query: string): RecommendationResult[] {
  const normalizedQuery = normalizeQuery(query);
  const queryTokens = normalizeText(query);
  const scenarios = detectScenarios(queryTokens);

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

      for (const scenario of scenarios) {
        const rule = SCENARIO_RULES[scenario];
        const categoryBias = rule.categoryBias[result.component.category] ?? 0;

        score += categoryBias;

        for (const role of rule.roles) {
          const roleRule = ROLE_RULES[role];
          const roleBias = roleRule.componentBias[result.component.name] ?? 0;
          score += roleBias;

          const reason = roleRule.reasons[result.component.name];
          if (reason && roleBias > 0) {
            reasons.push(reason);
          }
        }
      }

      if (result.component.category === "icon") {
        score -= 12;
        reasons.push("supporting component penalty");
      }

      return {
        ...result,
        score,
        reasons: unique(reasons)
      };
    })
    .map((result) => applyQueryShapeBias(queryTokens, result))
    .filter((result) => result.score >= 18)
    .sort((left, right) => right.score - left.score);
}
