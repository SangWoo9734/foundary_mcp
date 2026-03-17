import { toPriority } from "@repo/core";
import type { GenerateResult, MatchResult, ResultPriority } from "@repo/core";

export type OutputFormat = "text" | "json";

export type FormattedResult = {
  name: string;
  category: string;
  priority: ResultPriority;
  description: string;
  reasons: string[];
};

export function formatLegacyResults(results: MatchResult[]): string {
  if (results.length === 0) {
    return "No components matched the query.";
  }

  return results
    .map(
      (result, index) =>
        `${index + 1}. ${result.component.name} (score: ${result.score})\n   ${result.component.description}\n   reasons: ${result.reasons.join(", ")}`
    )
    .join("\n");
}

export function toFormattedResults(results: MatchResult[]): FormattedResult[] {
  return results.map((result) => ({
    name: result.component.name,
    category: result.component.category,
    priority: toPriority(result),
    description: result.component.description,
    reasons: result.reasons
  }));
}

export function formatSearchText(results: MatchResult[]): string {
  if (results.length === 0) {
    return "No components matched the query.";
  }

  return toFormattedResults(results)
    .map(
      (result, index) =>
        `${index + 1}. ${result.name}\n   priority: ${result.priority}\n   category: ${result.category}\n   ${result.description}\n   reasons: ${result.reasons.join(", ")}`
    )
    .join("\n");
}

export function formatSearchJson(query: string, adapter: string, results: MatchResult[]): string {
  return JSON.stringify(
    {
      query,
      adapter,
      results: toFormattedResults(results)
    },
    null,
    2
  );
}

export function formatGenerateText(result: GenerateResult): string {
  return [
    `query: ${result.query}`,
    `selected components: ${result.selectedComponents.join(", ")}`,
    "jsx:",
    result.jsx,
    "rationale:",
    ...result.rationale.map((reason, index) => `${index + 1}. ${reason}`)
  ].join("\n");
}

export function formatGenerateJson(result: GenerateResult): string {
  return JSON.stringify(result, null, 2);
}
