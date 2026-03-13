import type { ComponentMetadata } from "@repo/ai-metadata";

export type MatchResult = {
  component: ComponentMetadata;
  score: number;
  reasons: string[];
};

export type SearchResult = MatchResult;
export type RecommendationResult = MatchResult;
