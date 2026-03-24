import type { ComponentMetadata } from "@repo/ai-metadata";

export type ResultPriority = "high" | "medium" | "low";
export type CommandStatus = "ok" | "no_match" | "fallback" | "error";
export type RecommendIntentSource = "ai" | "fallback";
export type AIProvider = "gemini" | "openai";
export type QueryTypeHint = "component" | "section" | "page";

export type MatchResult = {
  component: ComponentMetadata;
  score: number;
  reasons: string[];
};

export type SearchResult = MatchResult;
export type RecommendationResult = MatchResult;

export type RecommendComponentsOptions = {
  model?: string;
  provider?: AIProvider;
};

export type RecommendComponentsOutput = {
  results: RecommendationResult[];
  intentSource: RecommendIntentSource;
  provider?: AIProvider;
  model?: string;
  queryType?: QueryTypeHint;
  rationale?: string[];
  note?: string;
};

export type GenerateOptions = {
  model?: string;
  provider?: AIProvider;
};

export type GenerateResult = {
  query: string;
  status: CommandStatus;
  selectedComponents: string[];
  jsx: string;
  rationale: string[];
  meta?: {
    intentSource: RecommendIntentSource;
    provider?: AIProvider;
    model?: string;
    queryType?: QueryTypeHint;
    note?: string;
  };
};
