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
};

type GenerateEnvelope = {
  command: "generate";
  adapter: string;
  query: string;
  status: CommandStatus;
  selectedComponents: string[];
  jsx: string;
  rationale: string[];
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
  results: MatchResult[]
): SearchLikeEnvelope {
  return {
    command,
    adapter,
    query,
    status: inferStatus(results),
    results: toFormattedResults(results)
  };
}

export function createGenerateEnvelope(
  query: string,
  adapter: string,
  result: GenerateResult
): GenerateEnvelope {
  return {
    command: "generate",
    adapter,
    query,
    status: result.status,
    selectedComponents: result.selectedComponents,
    jsx: result.jsx,
    rationale: result.rationale
  };
}

export function formatSearchLikeText(
  command: SearchLikeCommand,
  query: string,
  adapter: string,
  results: MatchResult[]
): string {
  const envelope = createSearchLikeEnvelope(command, query, adapter, results);

  if (envelope.status === "no_match") {
    return "No components matched the query.";
  }

  return [
    `command: ${envelope.command}`,
    `adapter: ${envelope.adapter}`,
    `query: ${envelope.query}`,
    `status: ${envelope.status}`,
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
  results: MatchResult[]
): string {
  return JSON.stringify(
    createSearchLikeEnvelope(command, query, adapter, results),
    null,
    2
  );
}

export function formatGenerateText(result: GenerateEnvelope): string {
  return [
    `command: ${result.command}`,
    `adapter: ${result.adapter}`,
    `query: ${result.query}`,
    `status: ${result.status}`,
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
