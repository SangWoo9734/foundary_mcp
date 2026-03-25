import { toPriority } from "@repo/core";
import type {
  CommandStatus,
  GenerateResult,
  MatchResult,
  ResultPriority
} from "@repo/core";

export type OutputFormat = "text" | "json";

export type FormattedResult = {
  name: string;
  category: string;
  priority: ResultPriority;
  description: string;
  reasons: string[];
};

export type SearchLikeCommand = "search" | "recommend";

type SearchLikeEnvelope = {
  command: SearchLikeCommand;
  adapter: string;
  query: string;
  status: CommandStatus;
  results: FormattedResult[];
  meta?: Record<string, string>;
};

type GenerateEnvelope = {
  command: "generate";
  adapter: string;
  query: string;
  status: CommandStatus;
  selectedComponents: string[];
  jsx: string;
  rationale: string[];
  meta?: Record<string, string>;
};

export function toFormattedResults(results: MatchResult[]): FormattedResult[] {
  return results.map((result) => ({
    name: result.component.name,
    category: result.component.category,
    priority: toPriority(result),
    description: result.component.description,
    reasons: result.reasons
  }));
}

function inferStatus(results: MatchResult[]): CommandStatus {
  return results.length === 0 ? "no_match" : "ok";
}

export function createSearchLikeEnvelope(
  command: SearchLikeCommand,
  query: string,
  adapter: string,
  results: MatchResult[],
  meta?: Record<string, string>
): SearchLikeEnvelope {
  return {
    command,
    adapter,
    query,
    status: inferStatus(results),
    results: toFormattedResults(results),
    meta
  };
}

export function createGenerateEnvelope(
  query: string,
  adapter: string,
  result: GenerateResult
): GenerateEnvelope {
  const meta: Record<string, string> = {};

  if (result.meta?.intentSource) {
    meta.intentSource = result.meta.intentSource;
  }

  if (result.meta?.provider) {
    meta.provider = result.meta.provider;
  }

  if (result.meta?.model) {
    meta.model = result.meta.model;
  }

  if (result.meta?.queryType) {
    meta.queryType = result.meta.queryType;
  }

  if (result.meta?.scope) {
    meta.scope = result.meta.scope;
  }

  if (typeof result.meta?.needsLayout === "boolean") {
    meta.needsLayout = String(result.meta.needsLayout);
  }

  if (typeof result.meta?.confidence === "number") {
    meta.confidence = result.meta.confidence.toFixed(2);
  }

  if (result.meta?.strategy) {
    meta.strategy = result.meta.strategy;
  }

  if (result.meta?.intentTags && result.meta.intentTags.length > 0) {
    meta.intentTags = result.meta.intentTags.join(",");
  }

  if (result.meta?.note) {
    meta.note = result.meta.note;
  }

  return {
    command: "generate",
    adapter,
    query,
    status: result.status,
    selectedComponents: result.selectedComponents,
    jsx: result.jsx,
    rationale: result.rationale,
    meta: Object.keys(meta).length > 0 ? meta : undefined
  };
}

export function formatSearchLikeText(
  command: SearchLikeCommand,
  query: string,
  adapter: string,
  results: MatchResult[],
  meta?: Record<string, string>
): string {
  const envelope = createSearchLikeEnvelope(command, query, adapter, results, meta);

  if (envelope.status === "no_match") {
    return "No components matched the query.";
  }

  const metaLines =
    envelope.meta && Object.keys(envelope.meta).length > 0
      ? Object.entries(envelope.meta).map(([key, value]) => `${key}: ${value}`)
      : [];

  return [
    `command: ${envelope.command}`,
    `adapter: ${envelope.adapter}`,
    `query: ${envelope.query}`,
    `status: ${envelope.status}`,
    ...metaLines,
    ...envelope.results.map(
      (result, index) =>
        `${index + 1}. ${result.name}\n   priority: ${result.priority}\n   category: ${result.category}\n   ${result.description}\n   reasons: ${result.reasons.join(", ")}`
    )
  ].join("\n");
}

export function formatSearchLikeJson(
  command: SearchLikeCommand,
  query: string,
  adapter: string,
  results: MatchResult[],
  meta?: Record<string, string>
): string {
  return JSON.stringify(
    createSearchLikeEnvelope(command, query, adapter, results, meta),
    null,
    2
  );
}

export function formatGenerateText(result: GenerateEnvelope): string {
  const metaLines =
    result.meta && Object.keys(result.meta).length > 0
      ? Object.entries(result.meta).map(([key, value]) => `${key}: ${value}`)
      : [];

  return [
    `command: ${result.command}`,
    `adapter: ${result.adapter}`,
    `query: ${result.query}`,
    `status: ${result.status}`,
    ...metaLines,
    `selected components: ${result.selectedComponents.join(", ")}`,
    "jsx:",
    result.jsx,
    "rationale:",
    ...result.rationale.map((reason, index) => `${index + 1}. ${reason}`)
  ].join("\n");
}

export function formatGenerateJson(result: GenerateEnvelope): string {
  return JSON.stringify(result, null, 2);
}
