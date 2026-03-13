import type { MatchResult } from "@repo/core";

export function formatResults(results: MatchResult[]): string {
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
