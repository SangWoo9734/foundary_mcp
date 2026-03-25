import { searchableComponents } from "@repo/ai-metadata";
import { resolveRecommendationsWithAI } from "./ai-intent.js";
import { normalizeQuery, normalizeText } from "./normalize.js";
import { scoreComponent } from "./score.js";
import type {
  GenerationStrategy,
  QueryScopeHint,
  QueryTypeHint,
  RecommendComponentsOptions,
  RecommendComponentsOutput,
  RecommendationResult
} from "./types.js";

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function inferQueryTypeFromTokens(tokens: string[]): QueryTypeHint {
  if (tokens.some((token) => ["page", "screen", "layout", "dashboard"].includes(token))) {
    return "page";
  }

  const hasSectionMarker = tokens.some((token) =>
    ["section", "card", "block"].includes(token)
  );
  const hasProfileEditIntent =
    tokens.includes("profile") && tokens.some((token) => ["edit", "update"].includes(token));

  if (hasProfileEditIntent && !hasSectionMarker) {
    return "page";
  }

  if (
    tokens.some((token) =>
      ["section", "card", "block", "form", "settings", "profile", "edit"].includes(token)
    )
  ) {
    return "section";
  }

  return "component";
}

function inferScopeFromTokens(
  queryType: QueryTypeHint,
  tokens: string[]
): QueryScopeHint {
  if (queryType === "page") {
    return "page";
  }

  if (queryType === "section") {
    if (tokens.some((token) => ["dashboard", "page", "layout", "screen"].includes(token))) {
      return "page_section";
    }

    return "standalone_section";
  }

  return "component";
}

function inferIntentTags(tokens: string[]): string[] {
  const tags = new Set<string>();

  if (tokens.some((token) => ["login", "auth", "signin", "signup"].includes(token))) {
    tags.add("auth");
  }
  if (tokens.some((token) => ["profile", "edit", "settings", "account"].includes(token))) {
    tags.add("profile");
    tags.add("edit");
  }
  if (tokens.some((token) => ["search", "find", "filter"].includes(token))) {
    tags.add("search");
  }
  if (tokens.some((token) => ["list", "listing", "products", "catalog", "grid"].includes(token))) {
    tags.add("listing");
  }
  if (tokens.some((token) => ["shopping", "commerce", "product"].includes(token))) {
    tags.add("commerce");
  }
  if (tokens.some((token) => ["form", "input", "field"].includes(token))) {
    tags.add("form");
  }
  if (tokens.some((token) => ["page", "layout", "screen", "dashboard"].includes(token))) {
    tags.add("page");
  }
  if (tokens.some((token) => ["section", "card", "block"].includes(token))) {
    tags.add("section");
  }

  return Array.from(tags).slice(0, 5);
}

function inferStrategy(
  queryType: QueryTypeHint,
  intentTags: string[]
): GenerationStrategy {
  if (intentTags.some((tag) => ["listing", "commerce"].includes(tag))) {
    return "listing";
  }

  if (intentTags.some((tag) => ["auth", "form", "edit", "profile"].includes(tag))) {
    return "form_flow";
  }

  if (queryType === "component") {
    return "single_component";
  }

  return "scaffold";
}

function rankBaseRecommendations(
  normalizedQuery: string,
  queryTokens: string[]
): RecommendationResult[] {
  return searchableComponents
    .map((component) =>
      scoreComponent(component, {
        mode: "recommend",
        queryTokens,
        normalizedQuery
      })
    )
    .map((result) => {
      let score = result.score;
      const reasons = [...result.reasons];

      if (result.component.category === "icon") {
        score -= 6;
        reasons.push("supporting component penalty");
      }

      return {
        ...result,
        score,
        reasons: unique(reasons)
      };
    })
    .sort((left, right) => right.score - left.score);
}

function selectFallbackComponents(
  queryType: QueryTypeHint,
  queryTokens: string[],
  ranked: RecommendationResult[]
): string[] {
  const rankedNames = ranked.map((result) => result.component.name);
  const available = new Set(rankedNames);
  const selected: string[] = [];

  function pick(name: string): void {
    if (available.has(name) && !selected.includes(name)) {
      selected.push(name);
    }
  }

  if (queryType === "page") {
    pick("Layout");
    pick("Card");
  }

  if (queryType === "section") {
    pick("Card");
  }

  if (queryType !== "component" || queryTokens.includes("form")) {
    pick("Form");
  }

  if (
    queryTokens.some((token) =>
      ["input", "password", "search", "login", "auth", "form", "edit"].includes(token)
    )
  ) {
    pick("Input");
  }

  if (
    queryTokens.some((token) =>
      ["button", "submit", "save", "login", "auth", "form", "edit"].includes(token)
    )
  ) {
    pick("Button");
  }

  if (
    queryTokens.some((token) => ["search", "password", "icon"].includes(token))
  ) {
    pick("Icon");
  }

  for (const name of rankedNames) {
    if (selected.length >= 5) {
      break;
    }

    pick(name);
  }

  return selected.slice(0, 5);
}

function normalizeSelectionByScope(
  selected: string[],
  scope: QueryScopeHint,
  needsLayout: boolean
): string[] {
  const normalized = Array.from(new Set(selected));

  if (
    (scope === "page" || scope === "page_section" || needsLayout) &&
    !normalized.includes("Layout")
  ) {
    normalized.unshift("Layout");
  }

  if (scope === "standalone_section") {
    return normalized.filter((name) => name !== "Layout");
  }

  return normalized.slice(0, 5);
}

function materializeResults(
  selectedComponents: string[],
  ranked: RecommendationResult[],
  source: "ai" | "fallback"
): RecommendationResult[] {
  const rankedMap = new Map(
    ranked.map((result) => [result.component.name, result] as const)
  );
  const componentsByName = new Map(
    searchableComponents.map((component) => [component.name, component] as const)
  );

  return selectedComponents
    .map((name) => {
      const base = rankedMap.get(name);
      if (base) {
        return {
          ...base,
          reasons:
            source === "ai"
              ? unique([...base.reasons, "selected by AI intent"])
              : base.reasons
        };
      }

      const component = componentsByName.get(name);
      if (!component) {
        return null;
      }

      return {
        component,
        score: source === "ai" ? 100 : 0,
        reasons:
          source === "ai" ? ["selected by AI intent"] : ["selected by fallback composition"]
      };
    })
    .filter((item): item is RecommendationResult => item !== null);
}

export function recommendComponents(query: string): RecommendationResult[] {
  const normalizedQuery = normalizeQuery(query);
  const queryTokens = normalizeText(query);
  const ranked = rankBaseRecommendations(normalizedQuery, queryTokens);
  const queryType = inferQueryTypeFromTokens(queryTokens);
  const selected = selectFallbackComponents(queryType, queryTokens, ranked);
  return materializeResults(selected, ranked, "fallback");
}

export async function recommendComponentsWithMode(
  query: string,
  options: RecommendComponentsOptions = {}
): Promise<RecommendComponentsOutput> {
  const provider = options.provider ?? "gemini";
  const model =
    options.model ?? (provider === "gemini" ? "gemini-2.0-flash" : "gpt-5-mini");
  const normalizedQuery = normalizeQuery(query);
  const queryTokens = normalizeText(query);
  const ranked = rankBaseRecommendations(normalizedQuery, queryTokens);
  const fallbackQueryType = inferQueryTypeFromTokens(queryTokens);
  const fallbackScope = inferScopeFromTokens(fallbackQueryType, queryTokens);
  const fallbackIntentTags = inferIntentTags(queryTokens);
  const fallbackStrategy = inferStrategy(fallbackQueryType, fallbackIntentTags);

  const aiIntent = await resolveRecommendationsWithAI(query, { model, provider });

  if (aiIntent.recommendedComponents.length > 0) {
    const selectedComponents = normalizeSelectionByScope(
      unique(aiIntent.recommendedComponents),
      aiIntent.scope,
      aiIntent.needsLayout
    );
    return {
      results: materializeResults(selectedComponents, ranked, "ai"),
      selectedComponents,
      intentSource: "ai",
      provider,
      model,
      queryType: aiIntent.queryType,
      scope: aiIntent.scope,
      needsLayout: aiIntent.needsLayout,
      confidence: aiIntent.confidence,
      intentTags: aiIntent.intentTags,
      strategy: aiIntent.strategy,
      rationale: aiIntent.rationale
    };
  }

  const fallbackSelected = selectFallbackComponents(
    fallbackQueryType,
    queryTokens,
    ranked
  );
  const selectedComponents = normalizeSelectionByScope(
    fallbackSelected,
    fallbackScope,
    fallbackScope === "page" || fallbackScope === "page_section"
  );

  return {
    results: materializeResults(selectedComponents, ranked, "fallback"),
    selectedComponents,
    intentSource: "fallback",
    provider,
    model,
    queryType: fallbackQueryType,
    scope: fallbackScope,
    needsLayout: fallbackScope === "page" || fallbackScope === "page_section",
    confidence: 0.55,
    intentTags: fallbackIntentTags,
    strategy: fallbackStrategy,
    note: aiIntent.reason
  };
}
