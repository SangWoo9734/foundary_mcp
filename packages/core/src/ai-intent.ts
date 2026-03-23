import type { RecommendScenario } from "./scenarios.js";
import type { AIProvider } from "./types.js";

type ResolveIntentOptions = {
  provider?: AIProvider;
  model?: string;
  timeoutMs?: number;
};

type ResolveIntentResult = {
  scenarios: RecommendScenario[];
  reason?: string;
};

const ALLOWED_SCENARIOS: RecommendScenario[] = ["auth", "form-edit", "search"];

function parseScenarioArray(value: unknown): RecommendScenario[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is RecommendScenario =>
    ALLOWED_SCENARIOS.includes(item as RecommendScenario)
  );
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

function buildIntentInstruction(query: string): string {
  return [
    'Classify UI intent and return only strict JSON: {"scenarios":["auth"|"form-edit"|"search"]}.',
    "Include only allowed values. If uncertain, return an empty array.",
    `Query: ${query}`
  ].join("\n");
}

async function callOpenAI(
  query: string,
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
          content:
            'Classify UI intent. Return only JSON: {"scenarios":[...]} with values from ["auth","form-edit","search"].'
        },
        {
          role: "user",
          content: query
        }
      ]
    })
  });
}

async function callGemini(
  query: string,
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
          parts: [{ text: buildIntentInstruction(query) }]
        }
      ]
    })
  });
}

export async function resolveIntentScenariosWithAI(
  query: string,
  options: ResolveIntentOptions = {}
): Promise<ResolveIntentResult> {
  const provider = options.provider ?? "gemini";
  const model =
    options.model ?? (provider === "gemini" ? "gemini-2.0-flash" : "gpt-5-mini");
  const timeoutMs = options.timeoutMs ?? 5000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response =
      provider === "gemini"
        ? await callGemini(query, model, controller.signal)
        : await callOpenAI(query, model, controller.signal);

    if (!response.ok) {
      return {
        scenarios: [],
        reason: `AI intent request failed (${provider}, ${response.status})`
      };
    }

    const payload = await response.json();
    const rawText = extractText(payload);
    const rawJson = extractJsonObject(rawText);

    if (!rawJson) {
      return {
        scenarios: [],
        reason: `AI intent response did not include JSON (${provider})`
      };
    }

    const parsed = JSON.parse(rawJson);
    const scenarios = parseScenarioArray(parsed?.scenarios);

    if (scenarios.length === 0) {
      return {
        scenarios: [],
        reason: `AI intent response returned no supported scenarios (${provider})`
      };
    }

    return { scenarios };
  } catch (error) {
    return {
      scenarios: [],
      reason:
        error instanceof Error
          ? `AI intent error (${provider}): ${error.message}`
          : `AI intent error (${provider})`
    };
  } finally {
    clearTimeout(timeout);
  }
}
