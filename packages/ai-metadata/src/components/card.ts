import type { ComponentMetadata } from "../types.js";

export const cardMetadata: ComponentMetadata = {
  name: "Card",
  category: "surface",
  description:
    "Elevated content container for grouping related information inside a rounded surface.",
  props: ["title", "description", "children"],
  useCases: ["content group", "summary block", "panel", "information section"],
  keywords: [
    "card",
    "panel",
    "surface",
    "container",
    "summary",
    "content block"
  ],
  relatedComponents: ["Layout", "Button"],
  tokens: {
    background: { ref: "color.neutral.100", source: "local" },
    border: { ref: "color.neutral.300", source: "local" },
    shadow: { ref: "shadow.soft", source: "local" },
    radius: { ref: "radius.card", source: "local" }
  }
};
