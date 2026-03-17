import { normalizeText } from "./normalize.js";
import { recommendComponents } from "./recommend.js";
import { detectScenarios } from "./scenarios.js";
import type { RecommendationResult } from "./types.js";
import type { GenerateResult } from "./types.js";

type GenerateTemplate = {
  requiredComponents: string[];
  jsx: string;
  rationale: string[];
};

function hasRecommendationSupport(
  recommendations: RecommendationResult[],
  requiredComponents: string[]
): boolean {
  const recommendedNames = new Set(
    recommendations.map((result) => result.component.name)
  );
  const uniqueRequired = Array.from(new Set(requiredComponents));
  const supportedCount = uniqueRequired.filter((name) =>
    recommendedNames.has(name)
  ).length;

  return supportedCount >= Math.max(1, uniqueRequired.length - 1);
}

function createFallbackResult(query: string): GenerateResult {
  return {
    query,
    status: "fallback",
    selectedComponents: ["Layout", "Card", "Button"],
    jsx: `<Layout title="Generated UI">
  <Card title="Suggested Section">
    <Button>Continue</Button>
  </Card>
</Layout>`,
    rationale: [
      "A generic fallback uses structure, grouped content, and a primary action.",
      "This keeps the output composable even when the query does not match a known scenario."
    ]
  };
}

const GENERATE_TEMPLATES: Record<"auth" | "form-edit" | "search", GenerateTemplate> = {
  auth: {
    requiredComponents: ["Form", "Input", "Input", "Button"],
    jsx: `<Form>
  <Input placeholder="Email" />
  <Input placeholder="Password" trailingIcon="eye" />
  <Button type="submit">Login</Button>
</Form>`,
    rationale: [
      "The generation starts from the recommended authentication component set.",
      "Form is needed to group the authentication fields.",
      "Two Input components are needed for email and password.",
      "Button is needed for the primary submit action."
    ]
  },
  "form-edit": {
    requiredComponents: ["Layout", "Card", "Form", "Input", "Input", "Button"],
    jsx: `<Layout title="Profile Edit">
  <Card title="Edit Profile">
    <Form>
      <Input placeholder="Full name" />
      <Input placeholder="Email address" />
      <Button type="submit">Save Changes</Button>
    </Form>
  </Card>
</Layout>`,
    rationale: [
      "The generation starts from the recommended edit-flow component set.",
      "Layout provides the page-level structure for an edit flow.",
      "Card groups the editable content into a clear section.",
      "Form and Input components handle structured profile updates.",
      "Button completes the save action."
    ]
  },
  search: {
    requiredComponents: ["Input", "Icon"],
    jsx: `<Input placeholder="Search..." leadingIcon="search" />`,
    rationale: [
      "The generation starts from the recommended search interaction components.",
      "Input is the primary interaction for search.",
      "Icon is used as a supporting search affordance."
    ]
  }
};

function createScenarioResult(
  query: string,
  scenario: "auth" | "form-edit" | "search",
  recommendations: RecommendationResult[]
): GenerateResult {
  const template = GENERATE_TEMPLATES[scenario];
  const selectedComponents = [...template.requiredComponents];

  if (!hasRecommendationSupport(recommendations, template.requiredComponents)) {
    return createFallbackResult(query);
  }

  return {
    query,
    status: "ok",
    selectedComponents,
    jsx: template.jsx,
    rationale: template.rationale
  };
}

export function generateUI(query: string): GenerateResult {
  const tokens = normalizeText(query);
  const scenarios = detectScenarios(tokens);
  const recommendations = recommendComponents(query);

  if (scenarios.includes("auth")) {
    return createScenarioResult(query, "auth", recommendations);
  }

  if (scenarios.includes("form-edit")) {
    return createScenarioResult(query, "form-edit", recommendations);
  }

  if (scenarios.includes("search")) {
    return createScenarioResult(query, "search", recommendations);
  }

  return createFallbackResult(query);
}
