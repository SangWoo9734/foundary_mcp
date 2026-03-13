import type { ComponentMetadata } from "../types.js";

export const iconMetadata: ComponentMetadata = {
  name: "Icon",
  category: "icon",
  description:
    "Small symbolic graphic used inside inputs and controls to communicate search and visibility affordances.",
  props: ["name", "size", "className"],
  useCases: ["search affordance", "password visibility", "supporting visual cue"],
  keywords: [
    "icon",
    "search icon",
    "eye icon",
    "symbol",
    "input icon",
    "control icon"
  ],
  relatedComponents: ["Input", "Button"],
  tokens: {
    foreground: { ref: "color.neutral.600", source: "local" },
    size: { ref: "spacing.5", source: "local" }
  }
};
