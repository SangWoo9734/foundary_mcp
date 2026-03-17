import { normalizeText } from "./normalize.js";
import { detectScenarios } from "./scenarios.js";
import type { GenerateResult } from "./types.js";

function createLoginPageResult(query: string): GenerateResult {
  return {
    query,
    selectedComponents: ["Form", "Input", "Input", "Button"],
    jsx: `<Form>
  <Input placeholder="Email" />
  <Input placeholder="Password" trailingIcon="eye" />
  <Button type="submit">Login</Button>
</Form>`,
    rationale: [
      "Form is needed to group the authentication fields.",
      "Two Input components are needed for email and password.",
      "Button is needed for the primary submit action."
    ]
  };
}

function createProfileEditResult(query: string): GenerateResult {
  return {
    query,
    selectedComponents: ["Layout", "Card", "Form", "Input", "Input", "Button"],
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
      "Layout provides the page-level structure for an edit flow.",
      "Card groups the editable content into a clear section.",
      "Form and Input components handle structured profile updates.",
      "Button completes the save action."
    ]
  };
}

function createSearchFieldResult(query: string): GenerateResult {
  return {
    query,
    selectedComponents: ["Input", "Icon"],
    jsx: `<Input placeholder="Search..." leadingIcon="search" />`,
    rationale: [
      "Input is the primary interaction for search.",
      "Icon is used as a supporting search affordance."
    ]
  };
}

function createFallbackResult(query: string): GenerateResult {
  return {
    query,
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

export function generateUI(query: string): GenerateResult {
  const tokens = normalizeText(query);
  const scenarios = detectScenarios(tokens);

  if (scenarios.includes("auth")) {
    return createLoginPageResult(query);
  }

  if (scenarios.includes("form-edit")) {
    return createProfileEditResult(query);
  }

  if (scenarios.includes("search")) {
    return createSearchFieldResult(query);
  }

  return createFallbackResult(query);
}
