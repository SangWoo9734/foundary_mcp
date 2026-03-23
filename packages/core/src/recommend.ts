import { searchableComponents } from "@repo/ai-metadata";
import { resolveIntentScenariosWithAI } from "./ai-intent.js";
import { normalizeQuery, normalizeText } from "./normalize.js";
import { scoreComponent } from "./score.js";
import {
  detectScenarios,
  type RecommendScenario,
  ROLE_RULES,
  SCENARIO_RULES
} from "./scenarios.js";
import type {
  RecommendComponentsOptions,
  RecommendComponentsOutput,
  RecommendationResult
} from "./types.js";

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

const UNSUPPORTED_PATTERN_TOKENS = [
  "list",
  "table",
  "dashboard",
  "collection",
  "grid"
];

const SUPPORTED_ANCHOR_TOKENS = [
  "login",
  "auth",
  "password",
  "search",
  "input",
  "form",
  "button",
  "profile",
  "edit",
  "layout",
  "card",
  "section",
  "page"
];

function isUnsupportedPatternQuery(queryTokens: string[]): boolean {
  const hasUnsupportedPattern = queryTokens.some((token) =>
    UNSUPPORTED_PATTERN_TOKENS.includes(token)
  );

  if (!hasUnsupportedPattern) {
    return false;
  }

  const hasSupportedAnchor = queryTokens.some((token) =>
    SUPPORTED_ANCHOR_TOKENS.includes(token)
  );

  return !hasSupportedAnchor;
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

  if (isUnsupportedPatternQuery(queryTokens)) {
    return [];
  }

  return rankRecommendations(normalizedQuery, queryTokens, scenarios);
}

function rankRecommendations(
  normalizedQuery: string,
  queryTokens: string[],
  scenarios: RecommendScenario[]
): RecommendationResult[] {
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

export async function recommendComponentsWithMode(
  query: string,
  options: RecommendComponentsOptions = {}
): Promise<RecommendComponentsOutput> {
  const mode = options.mode ?? "rule";
  const provider = options.provider ?? "gemini";
  const model =
    options.model ?? (provider === "gemini" ? "gemini-2.0-flash" : "gpt-5-mini");
  const normalizedQuery = normalizeQuery(query);
  const queryTokens = normalizeText(query);
  const ruleScenarios = detectScenarios(queryTokens);

  if (isUnsupportedPatternQuery(queryTokens)) {
    return {
      results: [],
      mode,
      intentSource: "fallback",
      provider,
      model,
      note:
        "This query pattern is outside the current custom baseline (list/table/dashboard)."
    };
  }

  if (mode === "rule") {
    return {
      results: rankRecommendations(normalizedQuery, queryTokens, ruleScenarios),
      mode,
      intentSource: "rule",
      provider
    };
  }

  const aiIntent = await resolveIntentScenariosWithAI(query, { model, provider });

  if (aiIntent.scenarios.length > 0) {
    return {
      results: rankRecommendations(normalizedQuery, queryTokens, aiIntent.scenarios),
      mode,
      intentSource: "ai",
      provider,
      model
    };
  }

  return {
    results: rankRecommendations(normalizedQuery, queryTokens, ruleScenarios),
    mode,
    intentSource: "fallback",
    provider,
    model,
    note: aiIntent.reason
  };
}
