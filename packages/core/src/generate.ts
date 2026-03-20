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

type DirectGenerateMatch = {
  tokens: string[];
  selectedComponents: string[];
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

const DIRECT_GENERATE_MATCHES: DirectGenerateMatch[] = [
  {
    tokens: ["password", "input"],
    selectedComponents: ["Input"],
    jsx: `<Input placeholder="Password" trailingIcon="eye" />`,
    rationale: [
      "This query asks for a single password input component.",
      "The generated result stays at component level rather than expanding to a full page."
    ]
  },
  {
    tokens: ["button", "submit"],
    selectedComponents: ["Button"],
    jsx: `<Button type="submit">Submit</Button>`,
    rationale: [
      "This query asks for a single submit action component.",
      "The generated result stays at component level so it can be reused in a larger flow."
    ]
  },
  {
    tokens: ["page", "layout"],
    selectedComponents: ["Layout", "Card"],
    jsx: `<Layout title="Page Title">
  <Card title="Section Title">
    Content
  </Card>
</Layout>`,
    rationale: [
      "This query asks for page-level structure rather than a full feature flow.",
      "Layout is used as the primary shell and Card is shown inside the layout scaffold."
    ]
  },
  {
    tokens: ["profile", "card"],
    selectedComponents: ["Card"],
    jsx: `<Card title="Profile">
  Profile details
</Card>`,
    rationale: [
      "This query asks for a grouped profile content block.",
      "The generated result stays focused on the card-level surface component."
    ]
  },
  {
    tokens: ["form", "section"],
    selectedComponents: ["Card", "Form", "Input", "Button"],
    jsx: `<Card title="Form Section">
  <Form>
    <Input placeholder="Field value" />
    <Button type="submit">Submit</Button>
  </Form>
</Card>`,
    rationale: [
      "This query asks for a section-level form block rather than a full page.",
      "Card groups the section and Form keeps the input and action together."
    ]
  }
];

function createDirectGenerateResult(
  query: string,
  selectedComponents: string[],
  jsx: string,
  rationale: string[]
): GenerateResult {
  return {
    query,
    status: "ok",
    selectedComponents,
    jsx,
    rationale
  };
}

function matchDirectGenerate(tokens: string[]): DirectGenerateMatch | null {
  for (const candidate of DIRECT_GENERATE_MATCHES) {
    if (candidate.tokens.every((token) => tokens.includes(token))) {
      return candidate;
    }
  }

  return null;
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
  const directMatch = matchDirectGenerate(tokens);

  if (directMatch) {
    return createDirectGenerateResult(
      query,
      directMatch.selectedComponents,
      directMatch.jsx,
      directMatch.rationale
    );
  }

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
