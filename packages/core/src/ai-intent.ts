import { searchableComponents } from "@repo/ai-metadata";
import type {
  AIProvider,
  GenerationStrategy,
  QueryScopeHint,
  QueryTypeHint
} from "./types.js";
import { buildIntentPrompt } from "./ai-prompt.js";

type ResolveIntentOptions = {
  provider?: AIProvider;
  model?: string;
  timeoutMs?: number;
  maxRetries?: number;
};

export type ResolveIntentResult = {
  recommendedComponents: string[];
  queryType: QueryTypeHint;
  scope: QueryScopeHint;
  needsLayout: boolean;
  confidence: number;
  intentTags: string[];
  strategy: GenerationStrategy;
  rationale: string[];
  reason?: string;
};

const ALLOWED_COMPONENT_NAMES = new Set(
  searchableComponents.map((component) => component.name)
);

const ALLOWED_QUERY_TYPES: QueryTypeHint[] = ["component", "section", "page"];
const ALLOWED_SCOPES: QueryScopeHint[] = [
  "component",
  "standalone_section",
  "page_section",
  "page"
];
const ALLOWED_STRATEGIES: GenerationStrategy[] = [
  "single_component",
  "form_flow",
  "listing",
  "scaffold"
];

function sanitizeReason(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function sanitizeRationale(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 5);
}

function sanitizeQueryType(value: unknown): QueryTypeHint {
  if (typeof value === "string" && ALLOWED_QUERY_TYPES.includes(value as QueryTypeHint)) {
    return value as QueryTypeHint;
  }

  return "component";
}

function sanitizeScope(value: unknown, queryType: QueryTypeHint): QueryScopeHint {
  if (typeof value === "string" && ALLOWED_SCOPES.includes(value as QueryScopeHint)) {
    return value as QueryScopeHint;
  }

  if (queryType === "page") {
    return "page";
  }

  if (queryType === "section") {
    return "standalone_section";
  }

  return "component";
}

function sanitizeNeedsLayout(value: unknown, scope: QueryScopeHint): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  return scope === "page" || scope === "page_section";
}

function sanitizeConfidence(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0.65;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

function sanitizeIntentTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().toLowerCase())
        .filter((item) => item.length >= 2)
    )
  ).slice(0, 5);
}

function sanitizeStrategy(
  value: unknown,
  queryType: QueryTypeHint,
  intentTags: string[]
): GenerationStrategy {
  if (typeof value === "string" && ALLOWED_STRATEGIES.includes(value as GenerationStrategy)) {
    return value as GenerationStrategy;
  }

  if (
    intentTags.some((tag) =>
      ["listing", "products", "catalog", "grid", "commerce"].includes(tag)
    )
  ) {
    return "listing";
  }

  if (
    intentTags.some((tag) => ["form", "edit", "auth", "settings", "profile"].includes(tag))
  ) {
    return "form_flow";
  }

  if (queryType === "component") {
    return "single_component";
  }

  return "scaffold";
}

function sanitizeRecommendedComponents(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => ALLOWED_COMPONENT_NAMES.has(item))
    )
  ).slice(0, 5);
}

function extractText(payload: any): string {
  const geminiText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof geminiText === "string") {
    return geminiText;
  }

  if (typeof payload?.output_text === "string") {
    return payload.output_text;
  }

  const content = payload?.output?.[0]?.content;

  if (Array.isArray(content)) {
    const textItem = content.find((item) => typeof item?.text === "string");
    if (typeof textItem?.text === "string") {
      return textItem.text;
    }
  }

  return "";
}

function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return text.slice(start, end + 1);
}

async function callOpenAI(
  prompt: { system: string; user: string },
  model: string,
  signal: AbortSignal
): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    signal,
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: prompt.system
        },
        {
          role: "user",
          content: prompt.user
        }
      ]
    })
  });
}

async function callGemini(
  prompt: { system: string; user: string },
  model: string,
  signal: AbortSignal
): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    signal,
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${prompt.system}\n\n${prompt.user}` }]
        }
      ]
    })
  });
}

export async function resolveRecommendationsWithAI(
  query: string,
  options: ResolveIntentOptions = {}
): Promise<ResolveIntentResult> {
  const provider = options.provider ?? "gemini";
  const model =
    options.model ?? (provider === "gemini" ? "gemini-2.0-flash" : "gpt-5-mini");
  const timeoutMs = options.timeoutMs ?? 5000;
  const maxRetries = options.maxRetries ?? 1;
  const prompt = buildIntentPrompt(query);
  let lastErrorReason: string | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response =
        provider === "gemini"
          ? await callGemini(prompt, model, controller.signal)
          : await callOpenAI(prompt, model, controller.signal);

      if (!response.ok) {
        lastErrorReason = `AI recommendation request failed (${provider}, ${response.status})`;
        continue;
      }

      const payload = await response.json();
      const rawText = extractText(payload);
      const rawJson = extractJsonObject(rawText);

      if (!rawJson) {
        lastErrorReason = `AI recommendation response did not include JSON (${provider})`;
        continue;
      }

      const parsed = JSON.parse(rawJson);
      const recommendedComponents = sanitizeRecommendedComponents(
        parsed?.recommendedComponents
      );
      const rationale = sanitizeRationale(parsed?.rationale);
      const queryType = sanitizeQueryType(parsed?.queryType);
      const scope = sanitizeScope(parsed?.scope, queryType);
      const needsLayout = sanitizeNeedsLayout(parsed?.needsLayout, scope);
      const confidence = sanitizeConfidence(parsed?.confidence);
      const intentTags = sanitizeIntentTags(parsed?.intentTags);
      const strategy = sanitizeStrategy(parsed?.strategy, queryType, intentTags);
      const reason = sanitizeReason(parsed?.reason);

      if (recommendedComponents.length === 0) {
        lastErrorReason =
          reason ??
          `AI recommendation returned no valid components from allow-list (${provider})`;
        continue;
      }

      return {
        recommendedComponents,
        queryType,
        scope,
        needsLayout,
        confidence,
        intentTags,
        strategy,
        rationale
      };

    } catch (error) {
      lastErrorReason =
        error instanceof Error
          ? `AI recommendation error (${provider}): ${error.message}`
          : `AI recommendation error (${provider})`;
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    recommendedComponents: [],
    queryType: "component",
    scope: "component",
    needsLayout: false,
    confidence: 0,
    intentTags: [],
    strategy: "scaffold",
    rationale: [],
    reason: lastErrorReason ?? `AI recommendation failed (${provider})`
  };
}
