import { searchableComponents } from "@repo/ai-metadata";
import type { AIProvider, QueryTypeHint } from "./types.js";
import { buildIntentPrompt } from "./ai-prompt.js";

type ResolveIntentOptions = {
  provider?: AIProvider;
  model?: string;
  timeoutMs?: number;
};

export type ResolveIntentResult = {
  recommendedComponents: string[];
  queryType: QueryTypeHint;
  rationale: string[];
  reason?: string;
};

const ALLOWED_COMPONENT_NAMES = new Set(
  searchableComponents.map((component) => component.name)
);

const ALLOWED_QUERY_TYPES: QueryTypeHint[] = ["component", "section", "page"];

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const prompt = buildIntentPrompt(query);

  try {
    const response =
      provider === "gemini"
        ? await callGemini(prompt, model, controller.signal)
        : await callOpenAI(prompt, model, controller.signal);

    if (!response.ok) {
      return {
        recommendedComponents: [],
        queryType: "component",
        rationale: [],
        reason: `AI recommendation request failed (${provider}, ${response.status})`
      };
    }

    const payload = await response.json();
    const rawText = extractText(payload);
    const rawJson = extractJsonObject(rawText);

    if (!rawJson) {
      return {
        recommendedComponents: [],
        queryType: "component",
        rationale: [],
        reason: `AI recommendation response did not include JSON (${provider})`
      };
    }

    const parsed = JSON.parse(rawJson);
    const recommendedComponents = sanitizeRecommendedComponents(
      parsed?.recommendedComponents
    );
    const rationale = sanitizeRationale(parsed?.rationale);
    const queryType = sanitizeQueryType(parsed?.queryType);
    const reason = sanitizeReason(parsed?.reason);

    if (recommendedComponents.length === 0) {
      return {
        recommendedComponents: [],
        queryType,
        rationale,
        reason:
          reason ??
          `AI recommendation returned no valid components from allow-list (${provider})`
      };
    }

    return {
      recommendedComponents,
      queryType,
      rationale
    };
  } catch (error) {
    return {
      recommendedComponents: [],
      queryType: "component",
      rationale: [],
      reason:
        error instanceof Error
          ? `AI recommendation error (${provider}): ${error.message}`
          : `AI recommendation error (${provider})`
    };
  } finally {
    clearTimeout(timeout);
  }
}
