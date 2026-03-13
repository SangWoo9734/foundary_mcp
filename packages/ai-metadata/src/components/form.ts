import type { ComponentMetadata } from "../types.js";

export const formMetadata: ComponentMetadata = {
  name: "Form",
  category: "form",
  description:
    "Composition layer for arranging labeled fields, helper messages, and submission actions into a clear form flow.",
  props: ["children", "className"],
  useCases: [
    "login form",
    "profile edit",
    "settings form",
    "validated form",
    "field grouping"
  ],
  keywords: [
    "form",
    "field group",
    "form layout",
    "label",
    "message",
    "validation",
    "submit form"
  ],
  relatedComponents: ["Input", "Button", "Layout"],
  tokens: {
    gap: { ref: "spacing.4", source: "local" },
    foreground: { ref: "color.neutral.900", source: "local" },
    mutedForeground: { ref: "color.neutral.600", source: "local" }
  }
};
