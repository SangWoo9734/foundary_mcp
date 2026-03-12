export type AiMetadata = {
  provider: string;
  model: string;
  capabilities: string[];
};

export const defaultAiMetadata: AiMetadata = {
  provider: "openai",
  model: "gpt-4.1",
  capabilities: ["text", "tool-calling", "structured-output"]
};

export function summarizeAiMetadata(metadata: AiMetadata): string {
  return `${metadata.provider}/${metadata.model} (${metadata.capabilities.join(", ")})`;
}

