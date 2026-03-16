import type { MatchResult, ResultPriority } from "./types.js";

export function toPriority(result: MatchResult): ResultPriority {
  if (result.score >= 60) {
    return "high";
  }

  if (result.score >= 20) {
    return "medium";
  }

  return "low";
}
