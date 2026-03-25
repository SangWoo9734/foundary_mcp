import { searchableComponents } from "@repo/ai-metadata";
import type {
  GenerationStrategy,
  QueryScopeHint,
  QueryTypeHint
} from "./types.js";

type IntentFewShot = {
  query: string;
  recommendedComponents: string[];
  queryType: QueryTypeHint;
  scope: QueryScopeHint;
  needsLayout: boolean;
  confidence: number;
  intentTags: string[];
  strategy: GenerationStrategy;
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
    scope: "page",
    needsLayout: true,
    confidence: 0.95,
    intentTags: ["auth", "form", "page"],
    strategy: "form_flow",
    rationale: [
      "Login query requires grouped credentials and a clear submit action.",
      "Layout and Card are useful for page-level structure."
    ]
  },
  {
    query: "search field",
    recommendedComponents: ["Input", "Icon"],
    queryType: "component",
    scope: "component",
    needsLayout: false,
    confidence: 0.94,
    intentTags: ["search", "input", "component"],
    strategy: "single_component",
    rationale: [
      "Search field is primarily an input with optional icon affordance."
    ]
  },
  {
    query: "dashboard page",
    recommendedComponents: ["Layout", "Card", "Input", "Button"],
    queryType: "page",
    scope: "page",
    needsLayout: true,
    confidence: 0.9,
    intentTags: ["dashboard", "listing", "page"],
    strategy: "scaffold",
    rationale: [
      "Dashboard page implies full-screen scaffold with grouped sections."
    ]
  },
  {
    query: "dashboard section",
    recommendedComponents: ["Layout", "Card"],
    queryType: "section",
    scope: "page_section",
    needsLayout: true,
    confidence: 0.88,
    intentTags: ["dashboard", "section"],
    strategy: "scaffold",
    rationale: [
      "Dashboard section is a section within a page-level layout context."
    ]
  },
  {
    query: "profile page",
    recommendedComponents: ["Layout", "Card", "Form", "Input", "Button"],
    queryType: "page",
    scope: "page",
    needsLayout: true,
    confidence: 0.91,
    intentTags: ["profile", "edit", "page"],
    strategy: "form_flow",
    rationale: ["Profile page requires full-page structure and edit actions."]
  },
  {
    query: "profile edit section",
    recommendedComponents: ["Card", "Form", "Input", "Button"],
    queryType: "section",
    scope: "standalone_section",
    needsLayout: false,
    confidence: 0.89,
    intentTags: ["profile", "edit", "section"],
    strategy: "form_flow",
    rationale: ["Section-level edit flow needs grouped fields and save action."]
  },
  {
    query: "user list",
    recommendedComponents: ["Layout", "Card", "Input", "Button"],
    queryType: "page",
    scope: "page",
    needsLayout: true,
    confidence: 0.8,
    intentTags: ["listing", "users", "page"],
    strategy: "listing",
    rationale: [
      "Current component set has no table/list component, so compose a practical scaffold."
    ]
  },
  {
    query: "shopping page with many products",
    recommendedComponents: ["Layout", "Card", "Input", "Button"],
    queryType: "page",
    scope: "page",
    needsLayout: true,
    confidence: 0.86,
    intentTags: ["commerce", "listing", "products", "page"],
    strategy: "listing",
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
      `A: {"queryType":"${example.queryType}","scope":"${example.scope}","needsLayout":${example.needsLayout},"confidence":${example.confidence},"intentTags":${JSON.stringify(
        example.intentTags
      )},"strategy":"${example.strategy}","recommendedComponents":${JSON.stringify(
        example.recommendedComponents
      )},"rationale":${JSON.stringify(example.rationale)}}`
    ].join("\n")
  ).join("\n\n");
}

export function buildIntentPrompt(query: string): PromptPayload {
  const system = [
    "You are a component selector for a custom design-system CLI.",
    "Respond with strict JSON only.",
    'JSON schema: {"queryType":"component|section|page","scope":"component|standalone_section|page_section|page","needsLayout":boolean,"confidence":0..1,"intentTags":["..."],"strategy":"single_component|form_flow|listing|scaffold","recommendedComponents":["..."],"rationale":["..."]}',
    "Rules:",
    `- Only use components from this allow-list: [${ALLOWED_COMPONENTS.join(", ")}].`,
    "- Select 1 to 5 components.",
    "- Distinguish section scope carefully: standalone_section vs page_section.",
    "- If scope is page or page_section, needsLayout should usually be true.",
    "- Add 2 to 5 intentTags capturing domain and interaction shape.",
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
