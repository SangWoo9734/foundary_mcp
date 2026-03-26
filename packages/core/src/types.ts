import type { ComponentMetadata } from "@repo/ai-metadata";

export type ResultPriority = "high" | "medium" | "low";
export type CommandStatus = "ok" | "no_match" | "fallback" | "error";
export type RecommendIntentSource = "ai" | "fallback";
export type AIProvider = "gemini" | "openai";
export type QueryTypeHint = "component" | "section" | "page";
export type QueryScopeHint =
  | "component"
  | "standalone_section"
  | "page_section"
  | "page";
export type GenerationStrategy =
  | "single_component"
  | "form_flow"
  | "listing"
  | "scaffold";

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
  forceFallback?: boolean;
};

export type RecommendComponentsOutput = {
  results: RecommendationResult[];
  selectedComponents: string[];
  intentSource: RecommendIntentSource;
  provider?: AIProvider;
  model?: string;
  queryType?: QueryTypeHint;
  scope?: QueryScopeHint;
  needsLayout?: boolean;
  confidence?: number;
  intentTags?: string[];
  strategy?: GenerationStrategy;
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
    scope?: QueryScopeHint;
    needsLayout?: boolean;
    confidence?: number;
    intentTags?: string[];
    strategy?: GenerationStrategy;
    note?: string;
  };
};
