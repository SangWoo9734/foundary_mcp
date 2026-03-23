import type { ComponentMetadata } from "@repo/ai-metadata";

export type ResultPriority = "high" | "medium" | "low";
export type CommandStatus = "ok" | "no_match" | "fallback" | "error";
export type RecommendMode = "rule" | "hybrid" | "ai";
export type RecommendIntentSource = "rule" | "ai" | "fallback";
export type AIProvider = "gemini" | "openai";

export type MatchResult = {
  component: ComponentMetadata;
  score: number;
  reasons: string[];
};

export type SearchResult = MatchResult;
export type RecommendationResult = MatchResult;

export type RecommendComponentsOptions = {
  mode?: RecommendMode;
  model?: string;
  provider?: AIProvider;
};

export type RecommendComponentsOutput = {
  results: RecommendationResult[];
  mode: RecommendMode;
  intentSource: RecommendIntentSource;
  provider?: AIProvider;
  model?: string;
  note?: string;
};

export type GenerateResult = {
  query: string;
  status: CommandStatus;
  selectedComponents: string[];
  jsx: string;
  rationale: string[];
};
