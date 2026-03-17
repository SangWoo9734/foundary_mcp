import type { ComponentMetadata } from "@repo/ai-metadata";

export type ResultPriority = "high" | "medium" | "low";
export type CommandStatus = "ok" | "no_match" | "fallback" | "error";

export type MatchResult = {
  component: ComponentMetadata;
  score: number;
  reasons: string[];
};

export type SearchResult = MatchResult;
export type RecommendationResult = MatchResult;

export type GenerateResult = {
  query: string;
  status: CommandStatus;
  selectedComponents: string[];
  jsx: string;
  rationale: string[];
};
