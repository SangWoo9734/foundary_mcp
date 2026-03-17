import type { ComponentMetadata } from "@repo/ai-metadata";
import type { MatchResult } from "./types.js";

type ScoreMode = "search" | "recommend";

type ScoreComponentOptions = {
  mode: ScoreMode;
  queryTokens: string[];
  normalizedQuery: string;
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function scoreComponent(
  component: ComponentMetadata,
  options: ScoreComponentOptions
): MatchResult {
  const { mode, queryTokens, normalizedQuery } = options;
  let score = 0;
  const reasons: string[] = [];
  const name = component.name.toLowerCase();
  const description = component.description.toLowerCase();
  const keywordSet = component.keywords.map((keyword) => keyword.toLowerCase());
  const useCaseSet = component.useCases.map((useCase) => useCase.toLowerCase());

  if (name === normalizedQuery) {
    score += mode === "search" ? 100 : 80;
    reasons.push("exact name match");
  } else if (name.includes(normalizedQuery) || normalizedQuery.includes(name)) {
    score += mode === "search" ? 60 : 48;
    reasons.push("partial name match");
  }

  for (const token of queryTokens) {
    if (name.includes(token)) {
      score += mode === "search" ? 20 : 16;
      reasons.push(`name includes "${token}"`);
      continue;
    }

    if (keywordSet.some((keyword) => keyword.includes(token))) {
      score += mode === "search" ? 15 : 14;
      reasons.push(`keyword match "${token}"`);
      continue;
    }

    if (useCaseSet.some((useCase) => useCase.includes(token))) {
      score += mode === "search" ? 12 : 18;
      reasons.push(`use case match "${token}"`);
      continue;
    }

    if (component.category.includes(token) || description.includes(token)) {
      score += mode === "search" ? 8 : 10;
      reasons.push(`semantic match "${token}"`);
    }
  }

  if (mode === "recommend") {
    if (component.category === "form") {
      score += 2;
      reasons.push("form composition bias");
    }

    if (component.category === "action") {
      score += 4;
      reasons.push("action bias");
    }
  }

  return {
    component,
    score,
    reasons: unique(reasons)
  };
}
