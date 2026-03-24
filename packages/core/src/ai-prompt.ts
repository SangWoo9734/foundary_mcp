import { searchableComponents } from "@repo/ai-metadata";
import type { QueryTypeHint } from "./types.js";

type IntentFewShot = {
  query: string;
  recommendedComponents: string[];
  queryType: QueryTypeHint;
  rationale: string[];
};

type PromptPayload = {
  system: string;
  user: string;
};

const ALLOWED_COMPONENTS = searchableComponents.map((component) => component.name);

const FEW_SHOT_EXAMPLES: IntentFewShot[] = [
  {
    query: "login page",
    recommendedComponents: ["Layout", "Card", "Form", "Input", "Button"],
    queryType: "page",
    rationale: [
      "Login query requires grouped credentials and a clear submit action.",
      "Layout and Card are useful for page-level structure."
    ]
  },
  {
    query: "search field",
    recommendedComponents: ["Input", "Icon"],
    queryType: "component",
    rationale: [
      "Search field is primarily an input with optional icon affordance."
    ]
  },
  {
    query: "profile edit section",
    recommendedComponents: ["Card", "Form", "Input", "Button"],
    queryType: "section",
    rationale: ["Section-level edit flow needs grouped fields and save action."]
  },
  {
    query: "user list",
    recommendedComponents: ["Layout", "Card", "Input", "Button"],
    queryType: "page",
    rationale: [
      "Current component set has no table/list component, so compose a practical scaffold."
    ]
  }
];

function compressMetadataContext(): string {
  return searchableComponents
    .map((component) => {
      const useCases = component.useCases.slice(0, 4).join(", ");
      const keywords = component.keywords.slice(0, 5).join(", ");
      return [
        `- name=${component.name}`,
        `category=${component.category}`,
        `description=${component.description}`,
        `useCases=[${useCases}]`,
        `keywords=[${keywords}]`
      ].join(" | ");
    })
    .join("\n");
}

function formatFewShots(): string {
  return FEW_SHOT_EXAMPLES.map((example) =>
    [
      `Q: ${example.query}`,
      `A: {"queryType":"${example.queryType}","recommendedComponents":${JSON.stringify(
        example.recommendedComponents
      )},"rationale":${JSON.stringify(example.rationale)}}`
    ].join("\n")
  ).join("\n\n");
}

export function buildIntentPrompt(query: string): PromptPayload {
  const system = [
    "You are a component selector for a custom design-system CLI.",
    "Respond with strict JSON only.",
    'JSON schema: {"queryType":"component|section|page","recommendedComponents":["..."],"rationale":["..."]}',
    "Rules:",
    `- Only use components from this allow-list: [${ALLOWED_COMPONENTS.join(", ")}].`,
    "- Select 1 to 5 components.",
    "- Prefer role-complete selections over sparse selections.",
    "- If query asks for something unsupported directly, return the closest composable set from the allow-list.",
    "- Keep rationale short and concrete."
  ].join("\n");

  const user = [
    "Component metadata context:",
    compressMetadataContext(),
    "",
    "Few-shot examples:",
    formatFewShots(),
    "",
    `Now answer for query: ${query}`
  ].join("\n");

  return { system, user };
}
