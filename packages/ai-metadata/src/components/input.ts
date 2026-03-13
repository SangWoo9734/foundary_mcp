import type { ComponentMetadata } from "../types.js";

export const inputMetadata: ComponentMetadata = {
  name: "Input",
  category: "input",
  description:
    "Single-line text field with support for search and password affordances, disabled state, focus state, and validation state.",
  props: [
    "placeholder",
    "disabled",
    "invalid",
    "leadingIcon",
    "trailingIcon",
    "value",
    "defaultValue"
  ],
  useCases: [
    "form entry",
    "search input",
    "password field",
    "login field",
    "validated input"
  ],
  keywords: [
    "input",
    "text field",
    "form input",
    "search field",
    "password input",
    "search",
    "field",
    "typing",
    "error input"
  ],
  relatedComponents: ["Form", "Button"],
  tokens: {
    background: { ref: "color.neutral.100", source: "local" },
    border: { ref: "color.neutral.300", source: "local" },
    focus: { ref: "color.secondary.blue.500", source: "local" },
    error: { ref: "color.secondary.orange.500", source: "local" },
    radius: { ref: "radius.lg", source: "local" }
  }
};
