export { generateUI } from "./generate.js";
export { normalizeQuery, normalizeText } from "./normalize.js";
export { recommendComponents, recommendComponentsWithMode } from "./recommend.js";
export { scoreComponent } from "./score.js";
export { searchComponents } from "./search.js";
export { toPriority } from "./priority.js";
export type {
  AIProvider,
  CommandStatus,
  GenerateOptions,
  GenerateResult,
  GenerationStrategy,
  MatchResult,
  QueryScopeHint,
  QueryTypeHint,
  RecommendComponentsOptions,
  RecommendComponentsOutput,
  RecommendIntentSource,
  RecommendationResult,
  ResultPriority,
  SearchResult
} from "./types.js";
